"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./mock-auth"
import { supabase } from "@/lib/supabase"

export interface Badge {
    id: string
    title: string
    description: string
    imageUrl: string
    location: string
    dateEarned: string
    earnedAtRaw?: string // ISO string for calculations
    benefit?: {
        short_description: string
        commerce_name: string
        valid_hours: number
    }
    activatedAt?: string | null // Start of countdown
    redeemedAt?: string | null // End of countdown
    isVerified?: boolean
}


interface PassportContextType {
    badges: Badge[]
    isMinting: boolean
    claimBadge: (location: string, attractionData?: { name: string, description: string, imageUrl: string }) => Promise<void>
    activateBadge: (badgeId: string) => Promise<boolean>
    redeemBadge: (badgeId: string) => Promise<boolean>
    walletAddress?: string
}

const PassportContext = createContext<PassportContextType | undefined>(undefined)

export function PassportProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [badges, setBadges] = useState<Badge[]>([])
    const [isMinting, setIsMinting] = useState(false)

    const fetchBadges = async () => {
        if (!user) {
            setBadges([])
            return
        }

        try {
            const { data: userBadges, error } = await supabase
                .from('user_badges')
                .select(`
                    id,
                    earned_at,
                    activated_at,
                    redeemed_at,
                    attraction:attractions (
                        id,
                        name,
                        description,
                        image_url
                    )
                `)
                .eq('user_id', user.id)
                .order('earned_at', { ascending: false })

            if (error) {
                console.error("Error fetching badges:", error.message, error.details, error.hint)
                return
            }

            const attractionIds = userBadges.map((ub: any) => ub.attraction?.id).filter(Boolean)

            let benefitsMap: Record<string, any> = {}
            if (attractionIds.length > 0) {
                const { data: benefits } = await supabase
                    .from('benefits')
                    .select('*')
                    .in('attraction_id', attractionIds)

                if (benefits) {
                    benefits.forEach(b => {
                        benefitsMap[b.attraction_id] = b
                    })
                }
            }

            const mappedBadges: Badge[] = await Promise.all(userBadges.map(async (item: any) => {
                let tokenId = '0'
                if (item.attraction_id === 'cataratas') tokenId = '1'
                else if (item.attraction_id === 'obelisco') tokenId = '2'

                let isVerified = false
                if (user?.walletAddress) {
                    try {
                        const res = await fetch(`/api/verify?wallet=${user.walletAddress}&tokenId=${tokenId}`)
                        if (res.ok) {
                            const data = await res.json()
                            isVerified = data.isVerified
                        }
                    } catch (e) {
                        console.error("Failed to verify on-chain status", e)
                    }
                }

                return {
                    id: item.id,
                    title: item.attraction?.name || 'Insignia',
                    description: item.attraction?.description || '',
                    imageUrl: item.attraction?.image_url || '',
                    location: item.attraction?.name || '',
                    dateEarned: new Date(item.earned_at).toLocaleDateString("es-ES"),
                    earnedAtRaw: item.earned_at,
                    activatedAt: item.activated_at,
                    redeemedAt: item.redeemed_at,
                    isVerified: isVerified,
                    benefit: benefitsMap[item.attraction?.id] ? {
                        short_description: benefitsMap[item.attraction?.id].short_description,
                        commerce_name: benefitsMap[item.attraction?.id].commerce_name,
                        valid_hours: benefitsMap[item.attraction?.id].valid_hours
                    } : undefined
                }
            }))

            setBadges(mappedBadges)
        } catch (err) {
            console.error("Unexpected error loading badges:", err)
        }
    }

    useEffect(() => {
        fetchBadges()
    }, [user, user?.walletAddress])

    const claimBadge = async (locationId: string, attractionData?: any) => {
        if (!user) return

        setIsMinting(true)

        try {
            const { data: existing } = await supabase
                .from('user_badges')
                .select('id')
                .eq('user_id', user.id)
                .eq('attraction_id', locationId)
                .maybeSingle()

            // Si ya existe en base de datos, verificamos si también existe el NFT
            if (existing) {
                const foundLocally = badges.find(b => b.title.toLowerCase() === attractionData?.name?.toLowerCase() || b.title.toLowerCase().includes(locationId.toLowerCase()));
                if (foundLocally && foundLocally.isVerified) {
                    // Si ya está Verificado, paramos aquí
                    await fetchBadges()
                    setIsMinting(false)
                    return
                }
                console.log("Insignia encontrada en BD pero no en Blockchain. Reintentando minteo Web3...");
            } else {
                // Forzar sincronización de sesión Supabase antes de insertar
                const { data: sessionData } = await supabase.auth.getSession();
                let finalUid = user.supabaseUid;

                if (!sessionData.session?.user) {
                    console.warn("Sesión en Supabase perdida antes de claim. Reconectando...");
                    const { data: authData } = await supabase.auth.signInAnonymously();
                    if (authData.user) {
                        finalUid = authData.user.id;
                    }
                } else {
                    finalUid = sessionData.session.user.id;
                }

                console.log(`Intentando insertar insignia con UID: ${finalUid}`);

                // Solo insertamos en la BD de Supabase si no existía antes
                const { error } = await supabase
                    .from('user_badges')
                    .insert({
                        user_id: user.id, // Primary Privy ID
                        attraction_id: locationId,
                        earned_at: new Date().toISOString()
                    })

                if (error) {
                    console.error("Error temporal de Supabase RLS, pero continuaremos con Web3:", error);
                    // No lanzamos el throw error para no bloquear el airdrop en Blockchain
                }
            }

            // Minteo en Blockchain sincrónico (con await) para garantizar que el "loader" quede la vista durante la transacción
            if (user?.walletAddress) {
                try {
                    console.log("Acuñando Token ERC-1155 en Blockchain para:", user.walletAddress);
                    const res = await fetch('/api/claim', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            attractionId: locationId,
                            walletAddress: user.walletAddress
                        })
                    });
                    const data = await res.json();
                    console.log("Resultado del minteo Web3:", data);
                } catch (err) {
                    console.error("Error grave en minteo Web3:", err);
                }
            } else {
                console.warn("⚠️ ALERTA WEB3: El usuario no tiene una walletAddress asignada. Se omitió el minteo en blockchain.");
            }

            await fetchBadges() // Refresca las insignias para obtener el nuevo status isVerified = true

        } catch (err: any) {
            console.error("Error claiming badge:", err?.message || err, err?.details, err?.hint)
        } finally {
            setIsMinting(false)
        }
    }

    const activateBadge = async (badgeId: string): Promise<boolean> => {
        if (!user) return false

        try {
            // Initiate countdown clock
            const { error } = await supabase
                .from('user_badges')
                .update({ activated_at: new Date().toISOString() })
                .eq('id', badgeId)
                .eq('user_id', user.id)

            if (error) throw error

            await fetchBadges()
            return true
        } catch (err) {
            console.error("Error activating badge:", err)
            return false
        }
    }

    const redeemBadge = async (badgeId: string): Promise<boolean> => {
        if (!user) return false

        try {
            // Permanently close the offer (Redeemed)
            const { error } = await supabase
                .from('user_badges')
                .update({ redeemed_at: new Date().toISOString() })
                .eq('id', badgeId)
                .eq('user_id', user.id)

            if (error) throw error

            await fetchBadges()
            return true
        } catch (err) {
            console.error("Error redeeming badge:", err)
            return false
        }
    }

    return (
        <PassportContext.Provider value={{ badges, isMinting, claimBadge, activateBadge, redeemBadge, walletAddress: user?.walletAddress }}>
            {children}
        </PassportContext.Provider>
    )
}

export function usePassport() {
    const context = useContext(PassportContext)
    if (context === undefined) {
        throw new Error("usePassport must be used within a PassportProvider")
    }
    return context
}
