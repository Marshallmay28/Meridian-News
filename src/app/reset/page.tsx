'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, RefreshCw } from 'lucide-react'

export default function ResetPage() {
    const [cleared, setCleared] = useState(false)

    const clearLocalStorage = () => {
        localStorage.removeItem('meridianArticles')
        localStorage.removeItem('meridianVideos')
        localStorage.removeItem('meridianPodcasts')
        localStorage.removeItem('meridianSettings')
        setCleared(true)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-8 h-8 text-red-600" />
                            <div>
                                <CardTitle className="text-2xl">Reset Local Storage</CardTitle>
                                <CardDescription>
                                    Clear all localStorage data and start fresh with database-only storage
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Warning */}
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ Warning</h3>
                            <p className="text-sm text-red-800 dark:text-red-200">
                                This will delete all articles, videos, and podcasts stored in your browser's localStorage.
                                Only do this if you want to start fresh with database-only storage.
                            </p>
                        </div>

                        {/* What this does */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What this does:</h3>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-5 list-disc">
                                <li>Deletes all localStorage content (articles, videos, podcasts)</li>
                                <li>Clears settings</li>
                                <li>After this, all NEW content will save directly to database</li>
                                <li>You'll start with a clean slate</li>
                            </ul>
                        </div>

                        {/* Clear Button */}
                        {!cleared ? (
                            <Button
                                onClick={clearLocalStorage}
                                className="w-full bg-red-600 hover:bg-red-700"
                                size="lg"
                            >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Clear All LocalStorage Data
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5" />
                                        LocalStorage Cleared!
                                    </h3>
                                    <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                                        All localStorage data has been deleted. You can now:
                                    </p>
                                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-5 list-disc">
                                        <li>Publish new articles - they'll save to database</li>
                                        <li>Generate AI content - it'll save to database</li>
                                        <li>Click on articles and they'll load from database</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={() => window.location.href = '/'}
                                    className="w-full"
                                    variant="outline"
                                >
                                    Go to Homepage
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
