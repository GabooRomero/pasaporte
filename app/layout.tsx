import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Pasaporte Digital Turístico",
    description: "Colecciona insignias oficiales de los mejores destinos turísticos.",
};

import { PrivyProviderWrapper } from "@/components/privy-provider-wrapper";
import { AuthProvider } from "@/lib/mock-auth";
import { PassportProvider } from "@/lib/mock-passport";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <PrivyProviderWrapper>
                    <AuthProvider>
                        <PassportProvider>
                            <div className="relative flex min-h-screen flex-col">
                                <Header />
                                <main className="flex-1">
                                    {children}
                                </main>
                            </div>
                        </PassportProvider>
                    </AuthProvider>
                </PrivyProviderWrapper>
            </body>
        </html>
    );
}
