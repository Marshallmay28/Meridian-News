import Link from 'next/link'
import { FileQuestion, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 p-4">
            <Card className="w-full max-w-md glass-card border-none shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <FileQuestion className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-6xl font-bold mb-2">404</CardTitle>
                    <CardTitle className="text-2xl font-serif">Page Not Found</CardTitle>
                    <CardDescription>
                        The page you're looking for doesn't exist or has been moved.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button
                            asChild
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            <Link href="/">
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="w-full"
                        >
                            <Link href="/?search=true">
                                <Search className="w-4 h-4 mr-2" />
                                Search Articles
                            </Link>
                        </Button>
                    </div>

                    {/* Popular links */}
                    <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Popular Pages:</p>
                        <div className="space-y-1">
                            <Link href="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                → Home
                            </Link>
                            <Link href="/publish" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                → Publish Article
                            </Link>
                            <Link href="/ai-lab" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                → AI Lab
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
