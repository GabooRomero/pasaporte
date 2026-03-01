"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { usePrivy, useWallets } from "@privy-io/react-auth"

// Extend user with our app-specific fields
interface User {
    id: string
    name: string
    email: string
    avatarUrl: string
    role: 'tourist' | 'commerce' | 'govt' | 'superadmin' // New field
    commerceAttractionId?: string | null // New field
    isAnonymous?: boolean
    walletAddress?: string
    supabaseUid?: string
}

interface AuthContextType {
    user: User | null
    login: () => void
    loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string } | undefined>
    loginAnonymously: () => Promise<{ success: boolean; error?: string } | undefined>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { ready, authenticated, user: privyUser, login: triggerPrivyLogin, logout: privyLogout } = usePrivy()
    const { wallets } = useWallets()
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy')

    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Helper to fetch profile data
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role, commerce_attraction_id')
                .eq('id', userId)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching profile:", error)
            }

            return data
        } catch (e) {
            console.error("Unexpected error fetching profile:", e)
            return null
        }
    }

    const syncWithSupabase = useCallback(async () => {
        if (!authenticated || !privyUser) {
            // Check if there is a leftover supabase session
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                const profile = await fetchProfile(session.user.id)
                setUser({
                    id: session.user.id,
                    name: session.user.user_metadata.full_name || session.user.email?.split("@")[0] || "Viajero",
                    email: session.user.email || "",
                    avatarUrl: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${session.user.id}`,
                    role: profile?.role || 'tourist',
                    commerceAttractionId: profile?.commerce_attraction_id,
                    isAnonymous: session.user.is_anonymous,
                    supabaseUid: session.user.id,
                })
            } else {
                setUser(null)
            }
            setIsLoading(false)
            return
        }

        // We are authenticated with Privy. Check Supabase session matching
        const { data: { session } } = await supabase.auth.getSession()
        let sbUser = session?.user

        // If no supabase session, we sign in anonymously as a bridge
        // Future fix: sync JWT using custom auth.
        if (!sbUser) {
            const { data, error } = await supabase.auth.signInAnonymously()
            if (!error && data.user) {
                sbUser = data.user
            }
        }

        if (sbUser) {
            const profile = await fetchProfile(sbUser.id)
            setUser({
                id: privyUser.id, // Primary UI id is Privy
                name: privyUser.google?.name || privyUser.email?.address?.split("@")[0] || "Viajero(a)",
                email: privyUser.email?.address || privyUser.google?.email || "",
                avatarUrl: ((privyUser.linkedAccounts?.find((a: any) => a.type === 'google_oauth')) as any)?.profilePictureUrl ||
                    (privyUser.google as any)?.pictureUrl ||
                    (privyUser.google as any)?.picture ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${privyUser.id}`,
                role: profile?.role || 'tourist',
                commerceAttractionId: profile?.commerce_attraction_id,
                isAnonymous: sbUser.is_anonymous,
                walletAddress: embeddedWallet?.address || privyUser.wallet?.address,
                supabaseUid: sbUser.id // Real DB foreign key
            })
        }
        setIsLoading(false)

    }, [ready, authenticated, privyUser, embeddedWallet])

    useEffect(() => {
        if (!ready) return // Wait for Privy to initialize
        syncWithSupabase()
    }, [ready, syncWithSupabase])

    const login = async () => {
        triggerPrivyLogin()
    }

    const loginWithEmail = async (email: string, pass: string) => {
        // Fallback or Admin logic
        setIsLoading(true)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: pass
            })

            if (error) throw error

            if (data.user) {
                const profile = await fetchProfile(data.user.id)
                setUser({
                    id: data.user.id,
                    name: data.user.user_metadata.full_name || data.user.email?.split("@")[0] || "Viajero",
                    email: data.user.email || "",
                    avatarUrl: data.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.user.id}`,
                    role: profile?.role || 'tourist',
                    commerceAttractionId: profile?.commerce_attraction_id,
                    supabaseUid: data.user.id
                })
                return { success: true }
            }
        } catch (error: any) {
            console.error("Email login error:", error)
            return { success: false, error: error.message }
        } finally {
            setIsLoading(false)
        }
    }

    const loginAnonymously = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase.auth.signInAnonymously()

            if (error) throw error

            if (data.user) {
                const profile = await fetchProfile(data.user.id)
                setUser({
                    id: data.user.id,
                    name: "Viajero Anónimo",
                    email: "",
                    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.user.id}`,
                    role: 'tourist',
                    isAnonymous: true,
                    supabaseUid: data.user.id
                })
                return { success: true }
            }
        } catch (error: any) {
            console.error("Anonymous login error:", error)
            return { success: false, error: error.message }
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        setIsLoading(true)
        if (authenticated) {
            await privyLogout()
        }
        await supabase.auth.signOut()
        setUser(null)
        setIsLoading(false)
        window.location.href = '/'
    }

    return (
        <AuthContext.Provider value={{ user, login, loginWithEmail, loginAnonymously, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export { supabase }
