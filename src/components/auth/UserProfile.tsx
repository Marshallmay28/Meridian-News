'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { LogOut, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserProfile() {
    const { data: session, status } = useSession()

    // Loading state
    if (status === 'loading') {
        return (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )
    }

    // Not logged in - show Sign In/Sign Up buttons
    if (!session?.user) {
        return (
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Link href="/auth/register">Sign Up</Link>
                </Button>
            </div>
        )
    }

    // Logged in - show user info and logout
    const userInitials = session.user.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'

    const isAdmin = (session.user as any).role === 'admin'

    return (
        <div className="flex items-center gap-2">
            {/* User Avatar */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                    {userInitials}
                </div>
                <div className="hidden sm:block">
                    <div className="text-sm font-medium">{session.user.name}</div>
                    {isAdmin && (
                        <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                            <Shield className="w-3 h-3" />
                            Admin
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Links */}
            <Button asChild variant="ghost" size="icon" className="rounded-full">
                <Link href="/profile">
                    <User className="w-4 h-4" />
                </Link>
            </Button>

            {isAdmin && (
                <Button asChild variant="ghost" size="icon" className="rounded-full">
                    <Link href="/admin/dashboard">
                        <Shield className="w-4 h-4 text-purple-600" />
                    </Link>
                </Button>
            )}

            {/* Logout Button */}
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Log out"
            >
                <LogOut className="w-4 h-4" />
            </Button>
        </div>
    )
}
