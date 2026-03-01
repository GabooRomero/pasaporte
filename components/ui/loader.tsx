import { Loader2 } from "lucide-react"

interface LoaderProps {
    text?: string
}

export function Loader({ text = "Sincronizando..." }: LoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-in fade-in duration-700 w-full">
            <div className="relative flex items-center justify-center">
                {/* Outer Glow Ring */}
                <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />

                {/* Inner Rotating Ring */}
                <div className="absolute w-16 h-16 border-2 border-indigo-500/30 rounded-full border-t-indigo-400 animate-[spin_3s_linear_infinite]" />

                {/* Center Icon */}
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400 relative z-10 drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
            </div>

            <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-semibold text-indigo-300 uppercase tracking-[0.2em] animate-pulse">
                    {text}
                </p>
                <div className="flex gap-1 h-1">
                    <span className="w-1 h-1 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-indigo-500/50 rounded-full animate-bounce"></span>
                </div>
            </div>
        </div>
    )
}
