"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader } from "@/components/ui/loader"

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [debugInfo, setDebugInfo] = useState<string>("")

    useEffect(() => {
        const handleAuth = async () => {
            // Debugging: Show what we actually received
            const fullUrl = window.location.href
            setDebugInfo(fullUrl)
            console.log("Auth Callback URL:", fullUrl)

            const code = searchParams.get('code')
            const next = searchParams.get('next') ?? '/passport'
            const errorCode = searchParams.get('error')
            const errorDescription = searchParams.get('error_description')

            // Case 1: Provider Error
            if (errorCode) {
                return router.push(`/auth/auth-code-error?error=${encodeURIComponent(`${errorCode}: ${errorDescription}`)}`)
            }

            // Case 2: PKCE Code
            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code)
                if (error) {
                    return router.push(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
                }
                // Use window.location to ensure a clean state refresh
                window.location.href = next
                return
            }

            // Case 3: Implicit/Hash Flow or existing session
            // Give Supabase a moment to process the hash
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                window.location.href = next
                return
            }
        }

        handleAuth()
    }, [searchParams, router])

    // Case 3b: Listener for late hash processing
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const next = searchParams.get('next') ?? '/passport'
                window.location.href = next
            }
        })

        return () => subscription.unsubscribe()
    }, [router, searchParams])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader text="Procesando autenticación..." />
            <div className="mt-8 p-4 max-w-lg text-xs font-mono text-muted-foreground bg-muted/50 rounded break-all">
                <p className="font-bold mb-2">Debug URL:</p>
                {debugInfo || "Reading URL..."}
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<Loader text="Cargando..." />}>
            <AuthCallbackContent />
        </Suspense>
    )
}
