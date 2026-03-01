"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/mock-auth"
import { usePassport } from "@/lib/mock-passport"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from "@/components/ui/loader"
import { BenefitModal } from "@/components/ui/benefit-modal"
import { MapPin, AlertCircle, Compass } from "lucide-react"

interface Attraction {
    id: string
    name: string
    description: string
    image_url: string
}

interface Benefit {
    id: string
    commerce_name: string
    short_description: string
    long_description: string | null
    valid_hours: number
}

function ClaimPageContent() {
    const searchParams = useSearchParams()
    const [locationId, setLocationId] = useState<string | null>(null)
    const [attraction, setAttraction] = useState<Attraction | null>(null)
    const [benefit, setBenefit] = useState<Benefit | null>(null)
    const [isLoadingAttraction, setIsLoadingAttraction] = useState(true)

    const [showBenefitModal, setShowBenefitModal] = useState(false)

    const { user, login } = useAuth()
    const { claimBadge, isMinting } = usePassport()
    const router = useRouter()
    const [claimStatus, setClaimStatus] = useState<"idle" | "claiming" | "success">("idle")

    useEffect(() => {
        let isMounted = true

        let id = searchParams.get("id") || searchParams.get("lugar")

        // Fallback for malformed URLs
        if (!id) {
            const keys = Array.from(searchParams.keys())
            const malformedKey = keys.find(k => k.includes("lugar=") || k.includes("lugar%3D"))
            if (malformedKey) {
                const parts = malformedKey.split(/=|%3D/)
                if (parts.length > 1) {
                    id = parts[parts.length - 1]
                }
            }
        }

        setLocationId(id)

        if (id) {
            const fetchAttraction = async () => {
                setIsLoadingAttraction(true)
                try {
                    // Fetch Attraction
                    const { data: attractionData, error: attractionError } = await supabase
                        .from('attractions')
                        .select('*')
                        .eq('id', id)
                        .single()

                    if (!isMounted) return

                    if (attractionData) {
                        setAttraction(attractionData)

                        // Fetch Benefits for this attraction
                        const { data: benefitData } = await supabase
                            .from('benefits')
                            .select('id, commerce_name, short_description, long_description, valid_hours')
                            .eq('attraction_id', id)
                            .maybeSingle()

                        if (isMounted && benefitData) {
                            setBenefit(benefitData as Benefit)
                        }
                    } else {
                        // Ignore generic abort errors but stop loading
                        if (attractionError?.message?.includes('aborted') || String(attractionError).includes('aborted')) {
                            // do nothing but let finally run
                        } else {
                            console.error("Attraction not found or error:", attractionError?.message, attractionError?.details, attractionError?.hint, attractionError)
                            setAttraction(null)
                        }
                    }
                } catch (err: any) {
                    if (!isMounted) return

                    if (err?.name !== 'AbortError' && !err?.message?.includes('aborted')) {
                        console.error("Unexpected error fetching attraction:", err?.message || err)
                        setAttraction(null)
                    }
                } finally {
                    if (isMounted) {
                        setIsLoadingAttraction(false)
                    }
                }
            }
            fetchAttraction()
        } else {
            setIsLoadingAttraction(false)
        }

        return () => {
            isMounted = false
        }
    }, [searchParams])

    const handleClaim = async () => {
        if (!user) {
            login()
            return
        }

        if (!attraction || !locationId) return

        setClaimStatus("claiming")
        // Pass dynamic attraction data to the minting function
        await claimBadge(locationId, {
            name: attraction.name,
            description: attraction.description,
            imageUrl: attraction.image_url // Note: snake_case from DB
        })
        setClaimStatus("success")

        // Show benefit modal if exists, otherwise redirect
        if (benefit) {
            setShowBenefitModal(true)
        }
    }

    const handleCloseModal = () => {
        setShowBenefitModal(false)
        router.push("/passport")
    }

    // Redirect automatically only if NO benefit exists
    useEffect(() => {
        if (claimStatus === "success" && !benefit && !showBenefitModal) {
            const timer = setTimeout(() => {
                router.push("/passport")
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [claimStatus, benefit, showBenefitModal, router])

    if (isLoadingAttraction || isMinting || claimStatus === "claiming") {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <Loader text={claimStatus === "claiming" ? "Acuñando tu insignia oficial..." : "Analizando atracción..."} />
            </div>
        )
    }

    // Only show loader redirect if success AND no modal is showing
    if (claimStatus === "success" && !showBenefitModal) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <Loader text="¡Insignia guardada! Redirigiendo a tu pasaporte..." />
            </div>
        )
    }

    // Error State: Attraction not found
    if (!attraction) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="container max-w-md mx-auto py-20 px-4 text-center glass-panel rounded-3xl animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-red-500/10 p-6 rounded-full inline-block mb-4 shadow-[0_0_30px_-5px_theme(colors.red.500/0.3)]">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-slate-100">Atracción Extraviada</h1>
                    <p className="text-slate-400 mb-6">
                        El código QR no es válido o esta atracción no se encuentra en nuestra bóveda de registros.
                    </p>
                    <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                        Volver al Portal Principal
                    </Button>
                    <div className="mt-8 text-xs text-slate-500 text-left bg-slate-900/50 p-4 rounded-xl font-mono border border-white/5">
                        <p className="font-semibold mb-2 text-slate-300">// IDs Disponibles (Testing):</p>
                        <ul className="list-none space-y-1">
                            <li><span className="text-indigo-400">?lugar=</span>glaciar</li>
                            <li><span className="text-indigo-400">?lugar=</span>cataratas</li>
                            <li><span className="text-indigo-400">?lugar=</span>obelisco</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container max-w-md mx-auto py-10 px-4 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                {/* Benefit Modal */}
                {benefit && (
                    <BenefitModal
                        isOpen={showBenefitModal}
                        onClose={handleCloseModal}
                        benefit={benefit}
                        attractionName={attraction.name}
                    />
                )}

                <Card className="border border-white/10 shadow-[0_0_50px_-15px_theme(colors.indigo.500/0.3)] bg-slate-900/60 backdrop-blur-3xl overflow-hidden rounded-[2rem]">
                    <div className="relative h-[300px] w-full bg-slate-950 flex items-center justify-center">
                        {/* Dynamic Image with vignette */}
                        <img
                            src={attraction.image_url}
                            alt={attraction.name}
                            className="w-full h-full object-cover opacity-80 mix-blend-screen"
                            style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex items-end p-6">
                            <div className="flex items-center gap-2 text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                                <Compass className="h-4 w-4 text-indigo-400" />
                                <span className="font-semibold tracking-widest uppercase text-xs text-indigo-100">{attraction.name}</span>
                            </div>
                        </div>
                    </div>

                    <CardHeader className="text-center pt-6 pb-2">
                        <p className="text-xs uppercase text-indigo-400 tracking-widest font-bold mb-1">Nueva Insignia Descubierta</p>
                        <CardTitle className="text-2xl font-bold text-white leading-tight">¡{attraction.name}!</CardTitle>
                        <CardDescription className="text-slate-400 mt-3 text-sm leading-relaxed px-2">
                            {attraction.description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl text-xs text-center text-slate-300">
                            <p>Esta insignia asegurará un registro inmutable de tu visita en el pasaporte digital.</p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 pb-8">
                        {user ? (
                            <Button size="lg" className="w-full text-base font-bold shadow-[0_0_20px_-5px_theme(colors.indigo.500/0.5)]" onClick={handleClaim}>
                                Reclamar Insignia Oficial
                            </Button>
                        ) : (
                            <Button size="lg" className="w-full gap-3 shadow-[0_0_20px_-5px_theme(colors.indigo.500/0.4)] relative" onClick={() => login()}>
                                <svg className="h-5 w-5 bg-white rounded-full p-[2px]" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.24-1.19-2.6z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Ingreso Rápido para Reclamar
                            </Button>
                        )}
                        <p className="text-[10px] text-center text-slate-500 font-medium">
                            Colección segura y verificada. Fricción Cero.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default function ClaimPage() {
    return (
        <div className="bg-slate-950 min-h-screen">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader text="Abriendo portal de la atracción..." />
                </div>
            }>
                <ClaimPageContent />
            </Suspense>
        </div>
    )
}
