"use client"

import { useAuth } from "@/lib/mock-auth"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import { ScanLine, Award, Ticket, TrendingUp, Store } from "lucide-react"
import { CommerceQR } from "@/components/commerce/commerce-qr"

export default function CommercePage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [metrics, setMetrics] = useState({
        totalBadges: 0,
        totalRedemptions: 0,
        todayRedemptions: 0,
        commerceName: "Tu Comercio"
    })
    const [loadingMetrics, setLoadingMetrics] = useState(true)

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/commerce/login')
                return
            }
            if (user.role !== 'commerce') {
                router.push('/passport')
                return
            }
            if (!user.commerceAttractionId) {
                console.error("Commerce user without attraction ID")
                return
            }
            fetchMetrics(user.commerceAttractionId)
        }
    }, [user, isLoading, router])

    const fetchMetrics = async (attractionId: string) => {
        try {
            // 1. Total Badges (Issued)
            const { count: badgesCount } = await supabase
                .from('user_badges')
                .select('*', { count: 'exact', head: true })
                .eq('attraction_id', attractionId)

            // 2. Total Redemptions
            const { count: redemptionsCount } = await supabase
                .from('user_badges')
                .select('*', { count: 'exact', head: true })
                .eq('attraction_id', attractionId)
                .not('redeemed_at', 'is', null)

            // 3. Fetch Commerce Name
            const { data: attraction } = await supabase
                .from('attractions')
                .select('title')
                .eq('id', attractionId)
                .single()

            setMetrics({
                totalBadges: badgesCount || 0,
                totalRedemptions: redemptionsCount || 0,
                todayRedemptions: 0,
                commerceName: attraction?.title || "Comercio VIP"
            })
        } catch (error) {
            console.error("Error fetching metrics:", error)
        } finally {
            setLoadingMetrics(false)
        }
    }

    if (isLoading || loadingMetrics) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <Loader text="Sincronizando portal de comercio..." />
            </div>
        )
    }

    if (!user || user.role !== 'commerce') {
        return null // Will redirect
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-6 relative overflow-hidden">
            {/* Ambient Background Glows para Comercio (Dorado) */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 -left-40 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container max-w-7xl mx-auto space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                {/* Header Section */}
                <div className="glass-panel border-amber-500/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="bg-gradient-to-br from-amber-400/20 to-amber-600/5 p-4 rounded-xl border border-amber-500/20 shadow-[0_0_20px_-5px_theme(colors.amber.500/0.3)]">
                            <Store className="h-8 w-8 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-amber-500/80 font-bold uppercase tracking-widest mb-1">
                                Panel de Operaciones VIP
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                                {metrics.commerceName}
                            </h1>
                        </div>
                    </div>
                    <div>
                        <Button variant="outline" onClick={() => router.push('/passport')} className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-300">
                            Vista de Turista
                        </Button>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Total Badges */}
                    <div className="glass-panel border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Award className="h-16 w-16 text-amber-500" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Turistas Atraídos</p>
                                <h3 className="text-4xl font-bold text-slate-50 mt-2">{metrics.totalBadges}</h3>
                                <p className="text-xs text-amber-500/80 mt-2 font-mono uppercase tracking-wider">Insignias Emitidas</p>
                            </div>
                            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 glow-amber mr-2">
                                <Award className="h-5 w-5 text-amber-400" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Total Redemptions */}
                    <div className="glass-panel border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Ticket className="h-16 w-16 text-emerald-500" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Canjes Exitosos</p>
                                <h3 className="text-4xl font-bold text-slate-50 mt-2">{metrics.totalRedemptions}</h3>
                                <p className="text-xs text-emerald-400/80 mt-2 font-mono uppercase tracking-wider">Retornos de Inversión</p>
                            </div>
                            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_-3px_theme(colors.emerald.500/0.2)] mr-2">
                                <Ticket className="h-5 w-5 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Conversion Rate */}
                    <div className="glass-panel border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="h-16 w-16 text-cyan-500" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Tasa de Conversión</p>
                                <h3 className="text-4xl font-bold text-slate-50 mt-2">
                                    {metrics.totalBadges > 0
                                        ? Math.round((metrics.totalRedemptions / metrics.totalBadges) * 100)
                                        : 0}%
                                </h3>
                                <p className="text-xs text-cyan-400/80 mt-2 font-mono uppercase tracking-wider">Eficacia del Premio</p>
                            </div>
                            <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_-3px_theme(colors.cyan.500/0.2)] mr-2">
                                <TrendingUp className="h-5 w-5 text-cyan-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* QR Generator Area*/}
                    {user.commerceAttractionId && (
                        <CommerceQR
                            attractionId={user.commerceAttractionId}
                            commerceName={metrics.commerceName}
                        />
                    )}

                    {/* Historial Placeholder */}
                    <div className="glass-panel border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center text-center min-h-[400px]">
                        <div className="bg-slate-900/80 p-6 rounded-full ring-1 ring-white/5 mb-6 shadow-inner">
                            <Store className="h-10 w-10 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-200 mb-2">Visitas Recientes</h3>
                        <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
                            El registro criptográfico en tiempo real de los turistas canjeando invitaciones aparecerá aquí próximamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
