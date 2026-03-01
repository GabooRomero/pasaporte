import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import Image from "next/image"

interface BadgeProps {
    title: string
    description: string
    imageUrl: string
    dateEarned?: string
    location?: string
    benefit?: {
        short_description: string
        commerce_name: string
    }
    onViewBenefit?: () => void
    isVerified?: boolean
}

export function BadgeCard({ title, description, imageUrl, dateEarned, location, benefit, onViewBenefit, isVerified }: BadgeProps) {
    return (
        <Card className="overflow-hidden border-2 border-white/5 bg-slate-900/40 backdrop-blur-md hover:border-indigo-500/50 hover:glow-indigo transition-all duration-300 group">
            <div className="relative aspect-square w-full bg-slate-950/50 flex items-center justify-center p-6 radial-gradient-to-b from-indigo-900/20 to-transparent">
                {/* Capa de brillo sutil en el fondo de la imagen */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {imageUrl ? (
                    <div className="relative w-full h-full transform transition-transform duration-500 group-hover:scale-105">
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                ) : (
                    <div className="w-32 h-32 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_30px_-5px_theme(colors.indigo.500/0.2)]">
                        <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">🏅</span>
                    </div>
                )}
            </div>
            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                            {title}
                        </CardTitle>
                        {location && <p className="text-xs text-indigo-400 mt-1 uppercase tracking-widest font-semibold">{location}</p>}
                    </div>
                </div>
                {isVerified && (
                    <div className="mt-2 flex flex-col items-start gap-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider float-left">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            VERIFICADO ON-CHAIN
                        </div>
                        <a
                            href={`https://sepolia.etherscan.io/token/0xaC2004fBb1a3e076F9BfDd683c25A406d6f1937B`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-indigo-400/80 hover:text-indigo-300 flex items-center gap-1 ml-1 transition-colors group/link"
                        >
                            Ver contrato en explorador <svg className="w-2.5 h-2.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                )}
            </CardHeader>
            <CardContent className="relative z-10">
                <CardDescription className="line-clamp-2 text-slate-400">
                    {description}
                </CardDescription>
                {dateEarned && (
                    <p className="text-[11px] text-slate-500 mt-3 font-mono">
                        OBTENIDO: {dateEarned}
                    </p>
                )}

                {benefit && (
                    <div className="mt-4 glass-panel border border-amber-500/20 rounded-lg p-3 flex items-center justify-between gap-2 overflow-hidden relative">
                        {/* Brillo de fondo para el beneficio */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent" />

                        <div className="flex items-start gap-3 relative z-10">
                            <span className="text-xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">🎁</span>
                            <div>
                                <p className="text-xs font-bold text-amber-200">{benefit.short_description}</p>
                                <p className="text-[10px] text-amber-500">en {benefit.commerce_name}</p>
                            </div>
                        </div>
                        {onViewBenefit && (
                            <Button size="sm" variant="outline" className="h-7 text-[10px] border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 relative z-10" onClick={onViewBenefit}>
                                Ver
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-2 pb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-2 font-medium"
                    onClick={async () => {
                        // 1. Construct the message
                        let titleText = `¡Desbloqueé la insignia ${title}!`
                        let bodyText = `Acabo de visitar ${title} y lo sumé a mi Pasaporte Turístico Web3. 🗺️✨`

                        if (benefit) {
                            titleText = `¡Gané ${benefit.short_description} en ${benefit.commerce_name}!`
                            bodyText = `¡Acabo de ganar un premio por visitar ${title}! 🎁 Dale una mirada al Pasaporte Turístico.`
                        }

                        const url = window.location.origin // Or specific landing page
                        const fullText = `${bodyText} ${url}`

                        const shareData = {
                            title: titleText,
                            text: bodyText,
                            url: url
                        }

                        try {
                            if (navigator.share) {
                                await navigator.share(shareData)
                            } else {
                                // Fallback: WhatsApp Web or Clipboard
                                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`
                                window.open(whatsappUrl, '_blank')
                            }
                        } catch (err) {
                            console.error("Error sharing:", err)
                        }
                    }}
                >
                    <Share2 className="h-3.5 w-3.5" />
                    COMPARTIR LOGRO
                </Button>
            </CardFooter>
        </Card>
    )
}
