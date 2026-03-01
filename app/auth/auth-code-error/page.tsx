import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default async function AuthErrorPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
            <div className="bg-destructive/10 p-6 rounded-full inline-block mb-4">
                <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Error de Autenticación</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
                No pudimos iniciar sesión con Google. Esto suele pasar por configuración incorrecta de las URLs.
            </p>

            {error && (
                <div className="bg-muted p-4 rounded text-xs font-mono mb-6 max-w-md overflow-auto text-left">
                    Error: {error}
                </div>
            )}

            <div className="flex gap-4">
                <Link href="/">
                    <Button variant="outline">Volver al Inicio</Button>
                </Link>
                <Link href="/claim?lugar=glaciar">
                    <Button>Reintentar</Button>
                </Link>
            </div>
        </div>
    )
}
