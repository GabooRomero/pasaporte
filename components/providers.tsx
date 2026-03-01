"use client"

import { AuthProvider } from "@/lib/mock-auth"
import { PassportProvider } from "@/lib/mock-passport"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <PassportProvider>
                {children}
            </PassportProvider>
        </AuthProvider>
    )
}
