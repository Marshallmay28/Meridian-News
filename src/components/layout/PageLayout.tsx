'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Moon, Sun, ArrowLeft, Brain } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { UserProfile } from '@/components/auth/UserProfile'

interface PageLayoutProps {
    children: React.ReactNode
    showBackButton?: boolean
    title?: string
}

export function PageLayout({ children, showBackButton = false, title }: PageLayoutProps) {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    if (!mounted) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile-Responsive Header */}
            <header className="sticky top-0 z-50 glass border-b border-border/40">
                <div className="container mx-auto px-3 sm:px-4">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Left - Back button or Logo */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {showBackButton ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.back()}
                                    className="gap-1 sm:gap-2"
                                >
                                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Back</span>
                                </Button>
                            ) : (
                                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                        <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-base sm:text-xl font-serif font-bold tracking-tight">
                                            <span className="hidden sm:inline">Meridian Post</span>
                                            <span className="sm:hidden">Meridian</span>
                                        </h1>
                                        <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered News</p>
                                    </div>
                                </div>
                            )}
                            {title && (
                                <h2 className="text-sm sm:text-lg font-semibold ml-2 sm:ml-4">{title}</h2>
                            )}
                        </div>

                        {/* Right - Theme toggle and Profile */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
                            >
                                {theme === 'light' ? (
                                    <Moon className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                    <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                            </Button>
                            <UserProfile />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {children}
            </main>
        </div>
    )
}
