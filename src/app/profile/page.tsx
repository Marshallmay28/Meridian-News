'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Shield, Mail, Calendar, ArrowLeft } from 'lucide-react'

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    const user = session.user as any
    const initials = user?.name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || 'U'

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="space-y-6">
                    {/* Profile Header */}
                    <Card className="glass-card">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl">{user?.name || 'User'}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4" />
                                        {user?.email}
                                    </CardDescription>
                                    {user?.role === 'admin' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Shield className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-600">Administrator</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Account Information */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>Your account details and settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="text-sm mt-1">{user?.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                    <p className="text-sm mt-1">{user?.name || 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                                    <p className="text-sm mt-1 capitalize">{user?.role || 'user'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                                    <p className="text-sm mt-1">
                                        {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Publishing Stats */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Publishing Status</CardTitle>
                            <CardDescription>Your daily publishing quota</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6">
                                {user?.role === 'admin' ? (
                                    <>
                                        <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
                                        <p className="text-sm text-muted-foreground">Unlimited Publishing (Admin)</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-4xl font-bold text-blue-600 mb-2">3</div>
                                        <p className="text-sm text-muted-foreground">Articles per day</p>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                onClick={() => router.push('/publish')}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                Create New Content
                            </Button>
                            {user?.role === 'admin' && (
                                <Button
                                    onClick={() => router.push('/admin/dashboard')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Admin Dashboard
                                </Button>
                            )}
                            <Button
                                onClick={() => router.push('/ai-lab')}
                                variant="outline"
                                className="w-full"
                            >
                                AI Lab
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
