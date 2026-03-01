"use client"

import { PrivyProvider } from "@privy-io/react-auth"

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "replace_me"}
            config={{
                loginMethods: ['google', 'apple', 'email'],
                appearance: {
                    theme: 'dark',
                    accentColor: '#6366f1',
                    logo: 'https://miruta.com/favicon.ico' // Placeholder
                },
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets',
                    }
                },
            }}
        >
            {children}
        </PrivyProvider>
    )
}
