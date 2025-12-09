'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        // Log error to console in development
        console.error('Application error:', error)

        // TODO: Send to error tracking service (Sentry, etc.)
        // logError(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950/20 dark:via-background dark:to-orange-950/20 p-4">
            <Card className="w-full max-w-md glass-card border-none shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-serif">Something Went Wrong</CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Don't worry, we're on it!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Error details (only in development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={reset}
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/')}
                            className="w-full"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </div>

                    {/* Help text */}
                    <p className="text-xs text-center text-muted-foreground">
                        If this problem persists, please contact support or try again later.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
