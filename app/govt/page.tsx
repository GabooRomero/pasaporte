"use client"

import { useAuth } from "@/lib/mock-auth"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import { Users, Crown, MapPin, Activity, CalendarClock, ShieldCheck } from "lucide-react"
import dynamic from 'next/dynamic'

const AttractionsMap = dynamic(() => import('@/components/ui/map-view'), {
    ssr: false,
    loading: () => <div className="min-h-[350px] bg-slate-900 animate-pulse rounded-2xl w-full flex items-center justify-center text-slate-500 font-mono text-sm">Inicializando Módulo Geoespacial en Vivo...</div>
})

export default function GovtPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        totalBadges: 0,
        totalRedemptions: 0
    })
    const [topAttractions, setTopAttractions] = useState<any[]>([])
    const [allAttractions, setAllAttractions] = useState<any[]>([])
    const [scanCounts, setScanCounts] = useState<Record<string, number>>({})
    const [loadingMetrics, setLoadingMetrics] = useState(true)

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/govt/login')
                return
            }
            if (user.role !== 'govt' && user.role !== 'superadmin') {
                router.push('/passport')
                return
            }
            fetchAllMetrics()
        }
    }, [user, isLoading, router])

    const fetchAllMetrics = async () => {
        try {
            // 1. Total Unique Users (Billeteras con al menos 1 interacción real)
            const { data: activeUsers } = await supabase
                .from('user_badges')
                .select('user_id')
            const usersCount = activeUsers ? new Set(activeUsers.map(b => b.user_id)).size : 0

            // 2. Total Badges Issued (Global)
            const { count: badgesCount } = await supabase
                .from('user_badges')
                .select('*', { count: 'exact', head: true })

            // 3. Total Redemptions (Global)
            const { count: redemptionsCount } = await supabase
                .from('user_badges')
                .select('*', { count: 'exact', head: true })
                .not('redeemed_at', 'is', null)

            setMetrics({
                totalUsers: usersCount || 0,
                totalBadges: badgesCount || 0,
                totalRedemptions: redemptionsCount || 0
            })

            // 4. Top Attractions and Heatmap logic
            const { data: recentBadges } = await supabase
                .from('user_badges')
                .select('attraction_id')
                .limit(5000)

            if (recentBadges) {
                const counts: Record<string, number> = {}
                recentBadges.forEach(b => {
                    counts[b.attraction_id] = (counts[b.attraction_id] || 0) + 1
                })
                setScanCounts(counts)

                // Fetch details, including latitude and longitude for the map
                const { data: attractions } = await supabase.from('attractions').select('id, name, latitude, longitude')
                setAllAttractions(attractions || [])

                const ranking = Object.entries(counts)
                    .map(([id, count]) => {
                        const attr = attractions?.find(a => a.id === id)
                        return {
                            id,
                            count,
                            name: attr?.name || id,
                            location: 'Punto Registrado'
                        }
                    })
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)

                setTopAttractions(ranking)
            }
        } catch (error) {
            console.error("Error fetching govt metrics:", error)
        } finally {
            setLoadingMetrics(false)
        }
    }

    if (isLoading || loadingMetrics) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <Loader text="Inicializando Centro de Mando..." />
            </div>
        )
    }

    if (!user || (user.role !== 'govt' && user.role !== 'superadmin')) {
        return null
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-6 relative overflow-hidden">
            {/* Ambient Background Glows para Gobierno (Esmeralda/Cian) */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container max-w-7xl mx-auto space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">

                {/* Header Section */}
                <div className="glass-panel border-emerald-500/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="bg-gradient-to-br from-emerald-400/20 to-cyan-600/5 p-4 rounded-xl border border-emerald-500/20 shadow-[0_0_20px_-5px_theme(colors.emerald.500/0.3)]">
                            <ShieldCheck className="h-8 w-8 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-widest mb-1">
                                Centro de Mando Analítico
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
                                Tablero Global <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <Activity className="h-3 w-3" /> Nivel: {user.role}
                        </span>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Total Turistas */}
                    <div className="glass-panel border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="h-16 w-16 text-cyan-500" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Turistas Activos</p>
                                <h3 className="text-4xl font-bold text-slate-50 mt-2">{metrics.totalUsers}</h3>
                                <p className="text-xs text-cyan-400/80 mt-2 font-mono uppercase tracking-wider">Billeteras Únicas</p>
                            </div>
                            <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 glow-emerald mr-2">
                                <Users className="h-5 w-5 text-cyan-400" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Total Badges */}
                    <div className="glass-panel border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Crown className="h-16 w-16 text-emerald-500" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Insignias Otorgadas</p>
                                <h3 className="text-4xl font-bold text-slate-50 mt-2">{metrics.totalBadges}</h3>
                                <p className="text-xs text-emerald-400/80 mt-2 font-mono uppercase tracking-wider">Acuñaciones Globales</p>
                            </div>
                            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_-3px_theme(colors.emerald.500/0.2)] mr-2">
                                <Crown className="h-5 w-5 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Total Redemptions */}
                    <div className="glass-panel border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CalendarClock className="h-16 w-16 text-indigo-500" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Beneficios Canjeados</p>
                                <h3 className="text-4xl font-bold text-slate-50 mt-2">{metrics.totalRedemptions}</h3>
                                <p className="text-xs text-indigo-400/80 mt-2 font-mono uppercase tracking-wider">Interacción Económica</p>
                            </div>
                            <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_-3px_theme(colors.indigo.500/0.2)] mr-2">
                                <CalendarClock className="h-5 w-5 text-indigo-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ranking Table */}
                    <div className="glass-panel border-white/5 rounded-3xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-white/5 bg-slate-900/50 flex justify-between items-center backdrop-blur-md">
                            <h3 className="font-semibold text-slate-200 flex items-center gap-3">
                                <Activity className="h-5 w-5 text-emerald-400" />
                                Atracciones en Tendencia
                            </h3>
                            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-white/5">Últimos 500 registros</span>
                        </div>
                        <div className="p-0 bg-slate-950/30 flex-1">
                            {topAttractions.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-900/80 text-slate-400 font-medium text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 border-b border-white/5">Ranking</th>
                                            <th className="px-6 py-4 border-b border-white/5">Atracción</th>
                                            <th className="px-6 py-4 border-b border-white/5 text-right">Mints</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {topAttractions.map((attr, index) => (
                                            <tr key={attr.id} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4 font-mono font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">#{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-200">{attr.name}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                        <MapPin className="h-3 w-3" /> {attr.location}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg font-mono font-bold">
                                                        {attr.count}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                                    <Activity className="h-10 w-10 text-slate-700 mb-4" />
                                    <span className="text-slate-400 text-sm">Esperando datos en la red...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Heatmap Geoespacial En Vivo */}
                    <div className="glass-panel border-white/5 rounded-3xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-white/5 bg-slate-900/50 flex justify-between items-center backdrop-blur-md">
                            <h3 className="font-semibold text-slate-200 flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-cyan-400" />
                                Módulo de Calor Geoespacial (En Vivo)
                            </h3>
                            <span className="text-xs font-mono text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded-md border border-cyan-500/20">Registros On-Chain</span>
                        </div>
                        <div className="flex-1 min-h-[350px] flex flex-col items-center justify-center bg-slate-950/50 relative overflow-hidden">
                            <div className="w-full h-full min-h-[400px]">
                                <AttractionsMap attractions={allAttractions} scanCounts={scanCounts} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
