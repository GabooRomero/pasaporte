"use client"

import { useState } from "react"
import { useAuth } from "@/lib/mock-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScanLine, ArrowRight, Store } from "lucide-react"

export default function CommerceLoginPage() {
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
                // Successful login, role check will happen in /commerce page
                // But we can check here too if we want better UX
                router.push('/commerce')
            } else {
                setError(result?.error || "Error de autenticación")
            }
        } catch (err) {
            setError("Ocurrió un error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-blue-600 p-6 text-center">
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4 ring-white/10">
                        <Store className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Portal Comercio</h1>
                    <p className="text-blue-100 text-sm mt-1">Gestión de Pasaporte Turístico</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="tu@comercio.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? "Ingresando..." : "Acceder al Panel"}
                            {!isLoading && <ArrowRight className="h-4 w-4" />}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-400">
                        Acceso exclusivo para comercios habilitados.
                        <br />
                        ¿Eres turista? <a href="/passport" className="text-blue-600 hover:underline">Ingresa aquí</a>
                    </div>
                </div>
            </div>
        </div>
    )
}
