"use client"

import { useState } from "react"
import { useAuth } from "@/lib/mock-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, ArrowRight, ShieldCheck } from "lucide-react"

export default function GovtLoginPage() {
    const { loginWithEmail } = useAuth()
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = await loginWithEmail(email, password)
            if (result && result.success) {
                router.push('/govt')
            } else {
                setError(result?.error || "Error de credenciales")
            }
        } catch (err) {
            setError("Ocurrió un error de sistema")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-800 p-6 text-center">
                    <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-1 ring-white/20">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Gobierno</h1>
                    <p className="text-slate-400 text-sm mt-1">Panel de Control Turístico</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Usuario Funcionario</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                                placeholder="funcionario@gobierno.tur"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Clave de Acceso</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? "Validando..." : "Ingresar al Sistema"}
                            {!isLoading && <ArrowRight className="h-4 w-4" />}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
                        Acceso restringido a personal autorizado.
                        <br />
                        Dirección de Turismo Digital.
                    </div>
                </div>
            </div>
        </div>
    )
}
