'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-2">
                    {/* Logo Placeholder - Text for MVP */}
                    {/* Logo Placeholder - Text for MVP */}
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="text-xl font-bold tracking-tight text-brand-dark dark:text-brand-light flex items-center gap-1.5">
                            <div className="w-8 h-8 bg-brand-green rounded-md flex items-center justify-center shadow-lg shadow-brand-green/20">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-black">
                                    <path d="M4 4h16v16H4z" />
                                    <path d="M4 12h16M12 4v16" />
                                </svg>
                            </div>
                            <span className="text-foreground">Brick<span className="text-brand-green">Fi</span></span>
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/#featured" className="transition-colors hover:text-foreground">
                            Marketplace
                        </Link>
                        <Link href="/portfolio" className="transition-colors hover:text-foreground">
                            Portfolio
                        </Link>
                        <Link href="/admin" className="transition-colors hover:text-emerald-400 text-brand-green font-bold">
                            Admin
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                        <Link href="/about">About Us</Link>
                    </Button>
                    <ConnectButton />
                </div>
            </div>
        </header>
    )
}
