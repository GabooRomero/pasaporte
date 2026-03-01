import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_15px_-3px_theme(colors.indigo.500/0.4)] hover:shadow-[0_0_20px_-3px_theme(colors.indigo.500/0.6)] border border-indigo-400/20",
                destructive:
                    "bg-red-600/90 text-red-50 hover:bg-red-500 shadow-[0_0_15px_-3px_theme(colors.red.500/0.4)] border border-red-400/20",
                outline:
                    "border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white backdrop-blur-sm",
                secondary:
                    "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-white/5 shadow-sm",
                ghost: "hover:bg-white/10 hover:text-slate-100 text-slate-300",
                link: "text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300",
                gold: "bg-amber-500 text-amber-950 hover:bg-amber-400 shadow-[0_0_15px_-3px_theme(colors.amber.500/0.4)] border border-amber-300/30",
                emerald: "bg-emerald-600 text-emerald-50 hover:bg-emerald-500 shadow-[0_0_15px_-3px_theme(colors.emerald.500/0.4)] border border-emerald-400/20",
            },
            size: {
                default: "h-11 px-5 py-2",
                sm: "h-9 rounded-md px-4",
                lg: "h-12 rounded-xl px-8 text-base",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
