'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function MigratePage() {
    const [status, setStatus] = useState<'idle' | 'migrating' | 'complete'>('idle')
    const [results, setResults] = useState<{ success: number; errors: number; total: number }>({ success: 0, errors: 0, total: 0 })
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    }

    const migrate = async () => {
        setStatus('migrating')
        setLogs([])
        addLog('🚀 Starting migration...')

        try {
            // Get all content from localStorage
            const articles = JSON.parse(localStorage.getItem('meridianArticles') || '[]')
            const videos = JSON.parse(localStorage.getItem('meridianVideos') || '[]')
            const podcasts = JSON.parse(localStorage.getItem('meridianPodcasts') || '[]')

            const allContent = [...articles, ...videos, ...podcasts]
            addLog(`📦 Found ${allContent.length} items in localStorage`)

            let successCount = 0
            let errorCount = 0

            for (const item of allContent) {
                try {
                    const response = await fetch('/api/content', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    })

                    if (response.ok) {
                        successCount++
                        addLog(`✅ Migrated: ${item.headline}`)
                    } else {
                        errorCount++
                        const error = await response.text()
                        addLog(`❌ Failed: ${item.headline} - ${error}`)
                    }
                } catch (error) {
                    errorCount++
                    addLog(`❌ Error: ${item.headline} - ${error}`)
                }
            }

            setResults({ success: successCount, errors: errorCount, total: allContent.length })
            addLog(`\n✨ Migration complete!`)
            addLog(`✅ Success: ${successCount}`)
            addLog(`❌ Errors: ${errorCount}`)
            setStatus('complete')
        } catch (error) {
            addLog(`❌ Migration failed: ${error}`)
            setStatus('idle')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Database className="w-8 h-8 text-blue-600" />
                            <div>
                                <CardTitle className="text-2xl">Database Migration</CardTitle>
                                <CardDescription>
                                    Migrate your localStorage content to Supabase database
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Instructions */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What does this do?</h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                This will copy all your articles, videos, and podcasts from browser localStorage to the Supabase database.
                                After migration, all content will be accessible from any device and will persist permanently.
                            </p>
                        </div>

                        {/* Migration Button */}
                        <Button
                            onClick={migrate}
                            disabled={status === 'migrating'}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            size="lg"
                        >
                            {status === 'migrating' ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Migrating...
                                </>
                            ) : (
                                <>
                                    <Database className="w-5 h-5 mr-2" />
                                    Start Migration
                                </>
                            )}
                        </Button>

                        {/* Results */}
                        {status === 'complete' && (
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{results.total}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-3xl font-bold text-green-600">{results.success}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-3xl font-bold text-red-600">{results.errors}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Logs */}
                        {logs.length > 0 && (
                            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                                {logs.map((log, i) => (
                                    <div key={i} className="mb-1">{log}</div>
                                ))}
                            </div>
                        )}

                        {/* Next Steps */}
                        {status === 'complete' && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Migration Complete!
                                </h3>
                                <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                                    Your content has been migrated to the database. You can now:
                                </p>
                                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-5 list-disc">
                                    <li>Go back to the homepage and click on articles - they should open now!</li>
                                    <li>All new content will automatically save to the database</li>
                                    <li>Your content is now accessible from any device</li>
                                </ul>
                                <Button
                                    onClick={() => window.location.href = '/'}
                                    className="mt-4 w-full"
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
