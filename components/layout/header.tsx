"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/mock-auth"
import { LogOut, User as UserIcon } from "lucide-react"

export function Header() {
    const { user, logout, isLoading } = useAuth()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-xl tracking-tight text-primary">
                            Pasaporte Turístico
                        </span>
                    </Link>
                </div>

                <nav className="flex items-center gap-2">
                    {!isLoading && user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-5 w-5 text-primary" />
                                    )}
                                </div>
                                <span className="text-sm font-medium hidden md:inline-block">
                                    {user.name}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={logout} title="Cerrar Sessión">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="w-8 h-8" /> // Spacer
                    )}
                </nav>
            </div>
        </header>
    )
}
