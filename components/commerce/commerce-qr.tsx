"use client"

import { QRCodeSVG } from 'qrcode.react'
import { Button } from "@/components/ui/button"
import { Download, Printer, QrCode } from "lucide-react"

interface CommerceQRProps {
    attractionId: string
    commerceName: string
}

export function CommerceQR({ attractionId, commerceName }: CommerceQRProps) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pasaporte-turistico.vercel.app'
    const claimUrl = `${baseUrl}/claim?id=${attractionId}`

    const downloadQR = () => {
        const svg = document.getElementById("commerce-qr") as unknown as SVGElement
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            // Add white background for the downloaded QR
            if (ctx) {
                ctx.fillStyle = "white"
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)
            }
            const pngFile = canvas.toDataURL("image/png")

            const downloadLink = document.createElement("a")
            downloadLink.download = `QR-${commerceName.replace(/\s+/g, '-')}.png`
            downloadLink.href = `${pngFile}`
            downloadLink.click()
        }

        img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }

    return (
        <div className="glass-panel border-amber-500/20 p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-amber-500/10 p-2 rounded-lg glow-amber">
                    <QrCode className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Punto de Acuñación (QR)</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-[0_0_30px_-5px_theme(colors.amber.500/0.4)] mb-6 ring-4 ring-amber-500/20 relative z-10 transform transition-transform hover:scale-105 duration-300">
                <QRCodeSVG
                    id="commerce-qr"
                    value={claimUrl}
                    size={220}
                    level={"H"}
                    includeMargin={true}
                    fgColor="#020617" // slate-950
                />
            </div>

            <p className="text-sm text-amber-100/70 mb-8 max-w-[280px] relative z-10">
                Imprime este portal digital y colócalo en mostrador. Los turistas lo escanearán para obtener su insignia oficial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
                <Button onClick={downloadQR} className="flex-1 gap-2 shadow-lg shadow-amber-500/20 h-12 rounded-xl text-amber-900 border-amber-500 hover:bg-amber-400" variant="gold">
                    <Download className="h-4 w-4" />
                    Descargar QR
                </Button>
                <Button className="flex-1 gap-2 border-white/10 hover:bg-white/10 text-slate-300 h-12 rounded-xl" variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 text-slate-400" />
                    Imprimir
                </Button>
            </div>
        </div>
    )
}
