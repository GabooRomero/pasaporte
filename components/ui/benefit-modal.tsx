"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Gift, Clock, CheckCircle2, Ticket } from "lucide-react"

interface Benefit {
    id: string
    commerce_name: string
    short_description: string
    long_description: string | null
    valid_hours: number
}

interface BenefitModalProps {
    isOpen: boolean
    onClose: () => void
    benefit: Benefit
    attractionName: string
    earnedAt?: string // New prop
    activatedAt?: string | null // Start of countdown
    redeemedAt?: string | null
    onActivate?: () => Promise<void>
    onRedeem?: () => Promise<void>
}

export function BenefitModal({ isOpen, onClose, benefit, attractionName, earnedAt, activatedAt, redeemedAt, onActivate, onRedeem }: BenefitModalProps) {
    // States based on the new activation logic
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null)
    const [status, setStatus] = useState<"available" | "active" | "redeemed">("available")
    const [isActivating, setIsActivating] = useState(false)
    const [isFinishing, setIsFinishing] = useState(false)

    useEffect(() => {
        if (!isOpen) return

        if (redeemedAt) {
            setStatus("redeemed")
            setTimeLeft(null)
            return
        }

        if (!activatedAt) {
            setStatus("available")
            setTimeLeft(null)
            return
        }

        // It has been activated. Let's calculate if it's still active based on valid_hours
        const calculateTimeLeft = () => {
            const now = new Date().getTime()
            const validWindowMs = benefit.valid_hours * 60 * 60 * 1000
            const activationTime = new Date(activatedAt).getTime()
            const expirationTime = activationTime + validWindowMs
            const distance = expirationTime - now

            if (distance <= 0) {
                setStatus("redeemed")
                // Only if onRedeem is defined, we should auto-close/auto-burn in the DB when time expires.
                // But for safety and MVP scope, we'll let the user/merchant explicitly click "Canjear"
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
                return
            }

            setStatus("active")
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((distance % (1000 * 60)) / 1000)

            setTimeLeft({ hours, minutes, seconds })
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)
        return () => clearInterval(timer)
    }, [isOpen, activatedAt, redeemedAt, benefit.valid_hours])

    const handleActivate = async () => {
        if (!onActivate) return
        setIsActivating(true)
        try {
            await onActivate()
        } catch (error) {
            console.error("Error activating:", error)
        } finally {
            setIsActivating(false)
        }
    }

    const handleRedeem = async () => {
        if (!onRedeem) return
        setIsFinishing(true)
        try {
            await onRedeem()
        } catch (error) {
            console.error("Error finishing redemption:", error)
        } finally {
            setIsFinishing(false)
        }
    }

    if (!isOpen) return null

    const isAvailable = status === "available"
    const isActive = status === "active"
    const isRedeemed = status === "redeemed"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm m-4 bg-slate-900 rounded-3xl shadow-[0_0_50px_-15px_theme(colors.amber.500/0.3)] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 relative">

                {/* Header Background Glow */}
                <div className={`absolute top-0 left-0 right-0 h-40 ${isRedeemed ? 'bg-emerald-500/20' : isActive ? 'bg-amber-500/30' : 'bg-indigo-500/20'} blur-3xl`} />

                <div className={`relative p-8 text-center border-b border-white/5 ${isRedeemed ? 'bg-emerald-950/50' : isActive ? 'bg-amber-950/50' : 'bg-slate-900/50'}`}>
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ring-2 ${isRedeemed ? 'ring-emerald-500/50 bg-emerald-500/20 glow-emerald drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : isActive ? 'ring-amber-500/50 bg-amber-500/20 glow-amber drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'ring-indigo-500/50 bg-indigo-500/20 glow-indigo drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]'}`}>
                        {isRedeemed ? (
                            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        ) : isActive ? (
                            <Clock className="h-10 w-10 text-amber-400 animate-pulse" />
                        ) : (
                            <Gift className="h-10 w-10 text-indigo-400" />
                        )}
                    </div>
                    <h2 className={`text-2xl font-bold mb-1 ${isRedeemed ? 'text-emerald-100' : isActive ? 'text-amber-100' : 'text-indigo-100'}`}>
                        {isRedeemed ? '¡Beneficio Canjeado!' : isActive ? '¡Oferta Activada!' : 'Beneficio Disponible'}
                    </h2>
                    <p className={`text-sm ${isRedeemed ? 'text-emerald-400/80' : isActive ? 'text-amber-400/80' : 'text-indigo-400/80'}`}>Por coleccionar {attractionName}</p>
                </div>

                <div className="p-8 space-y-8 relative z-10 bg-slate-900">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Ticket className={`h-5 w-5 ${isRedeemed ? 'text-emerald-500' : isActive ? 'text-amber-500' : 'text-indigo-500'}`} />
                            <h3 className="text-xl font-bold text-slate-100">{benefit.short_description}</h3>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">Garantizado por <span className="font-semibold text-white">{benefit.commerce_name}</span></p>

                        {benefit.long_description && (
                            <div className="mt-4 glass-panel bg-slate-800/50 p-4 rounded-xl text-sm text-slate-300 leading-relaxed text-left border-l-2 border-l-amber-500/50">
                                {benefit.long_description}
                            </div>
                        )}
                    </div>

                    {isRedeemed && (
                        <div className="glass-panel border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-5 flex flex-col items-center">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">REGISTRO CONFIRMADO</p>
                            <p className="text-sm font-mono text-emerald-300/80">
                                {redeemedAt ? new Date(redeemedAt).toLocaleString() : 'Transacción Completada'}
                            </p>
                        </div>
                    )}

                    {isActive && timeLeft && (
                        <div className="glass-panel border-amber-500/20 bg-amber-500/5 rounded-2xl p-5 flex flex-col items-center relative overflow-hidden group shadow-[0_0_30px_-5px_theme(colors.amber.500/0.2)]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex items-center gap-2 text-amber-500 mb-3 relative z-10">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider animate-pulse">Presentar antes de</span>
                            </div>
                            <div className="text-4xl font-mono font-bold text-amber-400 tabular-nums tracking-tight relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                {String(timeLeft.hours).padStart(2, '0')}<span className="text-amber-500/50 mx-1">:</span>
                                {String(timeLeft.minutes).padStart(2, '0')}<span className="text-amber-500/50 mx-1">:</span>
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </div>
                        </div>
                    )}

                    {isAvailable && (
                        <div className="glass-panel border-indigo-500/20 bg-indigo-500/5 rounded-2xl p-4 flex flex-col items-center text-center">
                            <p className="text-sm text-slate-400">
                                Este beneficio guarda <span className="font-bold text-slate-200">{benefit.valid_hours} horas</span> de validez desde el momento en que decidas activarlo en el mostrador del comercio.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        {isAvailable && onActivate && (
                            <Button
                                className="w-full text-base font-semibold h-12 rounded-xl shadow-[0_0_20px_-5px_theme(colors.amber.500/0.4)] relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950"
                                onClick={handleActivate}
                                disabled={isActivating}
                            >
                                {isActivating ? "Activando..." : "Activar Beneficio Ahora"}
                            </Button>
                        )}

                        {isActive && onRedeem && (
                            <Button
                                className="w-full text-base font-semibold h-12 rounded-xl shadow-[0_0_20px_-5px_theme(colors.emerald.500/0.4)] relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-emerald-950"
                                onClick={handleRedeem}
                                disabled={isFinishing}
                            >
                                {isFinishing ? "Verificando..." : "Marcar como Canjeado"}
                            </Button>
                        )}

                        <Button variant={isAvailable ? "secondary" : "default"} className={`w-full text-base font-semibold h-12 rounded-xl ${isAvailable ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`} onClick={onClose}>
                            {isAvailable ? "Volver a la Billetera" : "Cerrar Pantalla"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
