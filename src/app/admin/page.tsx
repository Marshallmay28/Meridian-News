'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isAdmin, loginAdmin } from '@/lib/admin-utils'
import { toast } from 'sonner'

export default function AdminLoginPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Redirect if already logged in
        if (isAdmin()) {
            router.push('/admin/dashboard')
        }
    }, [router])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        setTimeout(() => {
            if (loginAdmin(password)) {
                toast.success('Welcome, Admin!')
                router.push('/admin/dashboard')
            } else {
                toast.error('Invalid password')
                setPassword('')
            }
            setIsLoading(false)
        }, 500)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

            <Card className="w-full max-w-md glass-card border-white/20 shadow-2xl relative z-10">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-serif font-bold text-white">Admin Access</CardTitle>
                        <CardDescription className="text-gray-300 mt-2">
                            Meridian Post Administration
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-200">
                                Admin Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !password}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            {isLoading ? 'Authenticating...' : 'Access Dashboard'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="text-gray-300 hover:text-white"
                        >
                            ← Back to Home
                        </Button>
                    </div>

                    <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-blue-200 text-center">
                            🔒 Default password: <code className="bg-black/30 px-2 py-1 rounded">meridian2025</code>
                        </p>
                        <p className="text-xs text-gray-400 text-center mt-1">
                            Change this in <code className="bg-black/30 px-1 rounded">lib/admin-utils.ts</code>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
