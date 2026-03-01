"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/mock-auth"
import { usePassport } from "@/lib/mock-passport"
import { BadgeCard } from "@/components/ui/badge-card"
import { BenefitModal } from "@/components/ui/benefit-modal"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/ui/loader"
import { useRouter } from "next/navigation"
import { ScanLine, Compass, Sparkles } from "lucide-react"
import { useState } from "react"
import { Scanner } from '@yudiel/react-qr-scanner';

interface Benefit {
    id: string
    commerce_name: string
    short_description: string
    long_description: string | null
    valid_hours: number
}

export default function PassportPage() {
    const { user, login, loginAnonymously, isLoading: isAuthLoading } = useAuth()
    const { badges, redeemBadge, activateBadge, walletAddress } = usePassport()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthLoading && user) {
            if (user.role === 'commerce') {
                router.push('/commerce')
            } else if (user.role === 'govt' || user.role === 'superadmin') {
                router.push('/govt')
            }
        }
    }, [user, isAuthLoading, router])

    const [selectedBadge, setSelectedBadge] = useState<any | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isScanning, setIsScanning] = useState(false)

    const handleOpenBenefit = (badge: any) => {
        if (badge.benefit) {
            setSelectedBadge(badge)
            setIsModalOpen(true)
        }
    }

    const handleRedeem = async () => {
        if (selectedBadge) {
            await redeemBadge(selectedBadge.id)
            setSelectedBadge((prev: any) => ({ ...prev, redeemedAt: new Date().toISOString() }))
        }
    }

    if (isAuthLoading) {
        return <Loader />
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Glow de fondo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="glass-panel-heavy p-8 border border-white/5 rounded-3xl w-full max-w-md flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 relative z-10 shadow-[0_0_40px_-10px_theme(colors.indigo.500/0.2)]">
                    <div className="bg-indigo-500/10 p-5 rounded-2xl ring-1 ring-indigo-500/30 glow-indigo">
                        <Compass className="h-10 w-10 text-indigo-400" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Pasaporte Digital</h1>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                            Tu colección de memorias y beneficios exclusivos en formato digital.
                        </p>
                    </div>

                    <div className="w-full space-y-4">
                        <Button size="lg" onClick={() => login()} className="w-full relative shadow-[0_0_20px_-5px_theme(colors.indigo.500/0.5)]">
                            <span className="flex items-center gap-3">
                                <svg className="h-5 w-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.24-1.19-2.6z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Entrar con Google
                            </span>
                        </Button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                <span className="bg-slate-900 px-3 text-slate-500 rounded-full">O Ingreso Rápido</span>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => loginAnonymously()}
                            className="w-full text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-medium"
                        >
                            Entrar como Invitado
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-20 relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header Rediseñado */}
            <div className="glass-panel border-b border-white/5 sticky top-0 z-40 bg-slate-950/80">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/20 shadow-inner flex items-center justify-center border border-indigo-500/30 overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xl">😎</span>
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-indigo-400 font-bold tracking-wider">Pasaporte de</p>
                            <h2 className="text-sm font-semibold text-white">{user.name}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-8 px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 mt-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                            Mi Colección <Sparkles className="h-6 w-6 text-indigo-400" />
                        </h1>
                        <p className="text-slate-400 mt-2">
                            {badges.length} {badges.length === 1 ? 'insignia' : 'insignias'} descubiertas
                        </p>
                    </div>
                    <Button onClick={() => setIsScanning(true)} className="gap-2 shrink-0 glass-panel border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200" variant="secondary">
                        <ScanLine className="h-4 w-4" />
                        ESCANEAR CÓDIGO QR
                    </Button>
                </div>

                {isScanning && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-sm relative bg-slate-900 rounded-3xl overflow-hidden border border-indigo-500/30 shadow-[0_0_50px_-15px_theme(colors.indigo.500/0.4)]">
                            <div className="p-4 text-center border-b border-white/10 bg-black/40 backdrop-blur-md relative z-10 flex justify-between items-center">
                                <h3 className="font-bold text-white tracking-widest text-sm uppercase">Cámara Activa</h3>
                                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-full h-8 px-3" onClick={() => setIsScanning(false)}>Cerrar</Button>
                            </div>
                            <div className="relative aspect-square w-fullbg-black">
                                <Scanner
                                    onScan={(result) => {
                                        if (result[0]?.rawValue) {
                                            setIsScanning(false)
                                            try {
                                                const url = new URL(result[0].rawValue)
                                                if (url.pathname.includes('/claim')) {
                                                    router.push(result[0].rawValue)
                                                } else {
                                                    router.push(result[0].rawValue)
                                                }
                                            } catch {
                                                router.push(`/claim?lugar=${result[0].rawValue}`)
                                            }
                                        }
                                    }}
                                    onError={(err) => console.error("Scanner Error", err)}
                                />
                            </div>
                            <div className="p-4 text-center text-xs text-slate-400">
                                Apunta la cámara al Código QR Oficial impreso en la atracción para registrar tu visita.
                            </div>
                        </div>
                    </div>
                )}

                {badges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {badges.map((badge, index) => (
                            <BadgeCard
                                key={index}
                                title={badge.title}
                                description={badge.description}
                                imageUrl={badge.imageUrl}
                                location={badge.location}
                                dateEarned={badge.dateEarned}
                                benefit={badge.benefit}
                                isVerified={badge.isVerified}
                                onViewBenefit={() => handleOpenBenefit(badge)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] border border-white/5 rounded-3xl glass-panel p-8 text-center animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-2xl mx-auto">
                        <div className="bg-slate-900/50 p-6 rounded-full mb-6 ring-1 ring-white/10 shadow-inner">
                            <Compass className="h-12 w-12 text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white">Tu pasaporte está vacío</h3>
                        <p className="text-slate-400 max-w-md mt-3 leading-relaxed">
                            ¡Sal a explorar la ciudad y escanea los códigos QR ubicados en los puntos turísticos para empezar tu colección digital!
                        </p>
                        <Button className="mt-8 glowing-indigo" onClick={() => router.push("/claim?location=Plaza%20Central")}>
                            Probar Demo: Plaza Central
                        </Button>
                    </div>
                )}
            </div>

            {selectedBadge && selectedBadge.benefit && (
                <BenefitModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    benefit={{
                        id: "temp-id",
                        commerce_name: selectedBadge.benefit.commerce_name,
                        short_description: selectedBadge.benefit.short_description,
                        long_description: null,
                        valid_hours: selectedBadge.benefit.valid_hours || 24,
                    }}
                    attractionName={selectedBadge.title}
                    earnedAt={selectedBadge.earnedAtRaw}
                    activatedAt={selectedBadge.activatedAt}
                    redeemedAt={selectedBadge.redeemedAt}
                    onActivate={async () => {
                        await activateBadge(selectedBadge.id)
                        setSelectedBadge((prev: any) => ({ ...prev, activatedAt: new Date().toISOString() }))
                    }}
                    onRedeem={handleRedeem}
                />
            )}
        </div>
    )
}
