'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, Trash2, Eye, TrendingUp, FileText, Video, Mic, Brain, Users, Settings, RefreshCw, AlertTriangle, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Content, getAllContent, CATEGORIES, formatDate } from '@/lib/content-models'
import {
    isAdmin,
    logoutAdmin,
    deleteContentById,
    getContentStats,
    getPlatformSettings,
    savePlatformSettings,
    deleteAllAIContent,
    deleteAllUserContent,
    type PlatformSettings
} from '@/lib/admin-utils'
import { toast } from 'sonner'

export default function AdminDashboard() {
    const router = useRouter()
    const [content, setContent] = useState<Content[]>([])
    const [stats, setStats] = useState(getContentStats())
    const [settings, setSettings] = useState<PlatformSettings>(getPlatformSettings())
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [contentToDelete, setContentToDelete] = useState<Content | null>(null)
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
    const [bulkDeleteType, setBulkDeleteType] = useState<'ai' | 'user' | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'article' | 'video' | 'podcast' | 'ai' | 'user'>('all')
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        if (!isAdmin()) {
            router.push('/admin')
            return
        }
        loadData()

        // Load theme
        const savedTheme = localStorage.getItem('meridianAdminTheme') as 'light' | 'dark' || 'light'
        setTheme(savedTheme)
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark')
        }
    }, [router])

    const loadData = async () => {
        try {
            // Fetch content from database
            const response = await fetch('/api/content')
            if (response.ok) {
                const data = await response.json()
                setContent(data.content || [])
            } else {
                // Fallback to localStorage
                setContent(getAllContent())
            }
            setStats(getContentStats())
        } catch (error) {
            console.error('Failed to load content:', error)
            setContent(getAllContent())
        }
    }

    const handleLogout = () => {
        logoutAdmin()
        toast.success('Logged out successfully')
        router.push('/admin')
    }

    const handleDeleteContent = async () => {
        if (!contentToDelete) return

        try {
            const response = await fetch(`/api/content/${contentToDelete.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                // Clean up localStorage to prevent deleted content from persisting
                deleteContentById(contentToDelete.id)

                toast.success('Content deleted successfully')
                setDeleteDialogOpen(false)
                setContentToDelete(null)
                loadData() // Refresh content list
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to delete content')
            }
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to delete content')
        }
    }

    const handleBulkDelete = async () => {
        if (bulkDeleteType === 'ai') {
            await deleteAllAIContent()
            toast.success('All AI content deleted')
        } else if (bulkDeleteType === 'user') {
            await deleteAllUserContent()
            toast.success('All user content deleted')
        }
        setBulkDeleteDialogOpen(false)
        setBulkDeleteType(null)
        loadData()
    }

    const handleSettingsChange = (key: keyof PlatformSettings, value: any) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        savePlatformSettings(newSettings)
        toast.success('Settings updated')
    }

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('meridianAdminTheme', newTheme)
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    const filteredContent = content.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.author.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter =
            filterType === 'all' ||
            (filterType === 'ai' && item.isAI) ||
            (filterType === 'user' && !item.isAI) ||
            item.mediaType === filterType

        return matchesSearch && matchesFilter
    })

    if (!isAdmin()) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-border/40">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-6 h-6 text-purple-600" />
                                <h1 className="text-xl font-serif font-bold">Admin Dashboard</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="rounded-full"
                            >
                                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Site
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="glass-card border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.articles} articles • {stats.videos} videos • {stats.podcasts} podcasts
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">AI vs User</CardTitle>
                            <Brain className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.aiGenerated} / {stats.userGenerated}</div>
                            <p className="text-xs text-muted-foreground">
                                AI-generated vs User-created
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Posts</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.todayPosts}</div>
                            <p className="text-xs text-muted-foreground">
                                Published in last 24 hours
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalViews}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalLikes} likes total
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Content Management */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="glass-card border-none">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Content Management</CardTitle>
                                        <CardDescription>View and manage all published content</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={loadData}>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Refresh
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Input
                                        placeholder="Search by title or author..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1"
                                    />
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value as any)}
                                        className="px-3 py-2 rounded-md border border-input bg-background"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="article">Articles</option>
                                        <option value="video">Videos</option>
                                        <option value="podcast">Podcasts</option>
                                        <option value="ai">AI Generated</option>
                                        <option value="user">User Created</option>
                                    </select>
                                </div>

                                {/* Content Table */}
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="max-h-[600px] overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="bg-secondary sticky top-0">
                                                <tr>
                                                    <th className="text-left p-3 text-sm font-medium">Content</th>
                                                    <th className="text-left p-3 text-sm font-medium">Type</th>
                                                    <th className="text-left p-3 text-sm font-medium">Author</th>
                                                    <th className="text-left p-3 text-sm font-medium">Stats</th>
                                                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredContent.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
                                                            No content found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredContent.map((item) => (
                                                        <tr key={item.id} className="border-t hover:bg-secondary/50 transition-colors">
                                                            <td className="p-3">
                                                                <div className="flex items-start space-x-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium line-clamp-1">{item.headline}</p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatDate(item.publishedAt)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex flex-col gap-1">
                                                                    <Badge variant="outline" className="w-fit">
                                                                        {item.mediaType === 'video' && <Video className="w-3 h-3 mr-1" />}
                                                                        {item.mediaType === 'podcast' && <Mic className="w-3 h-3 mr-1" />}
                                                                        {item.mediaType === 'article' && <FileText className="w-3 h-3 mr-1" />}
                                                                        {item.mediaType}
                                                                    </Badge>
                                                                    {item.isAI && (
                                                                        <Badge variant="secondary" className="w-fit bg-purple-100 text-purple-700">
                                                                            <Brain className="w-3 h-3 mr-1" />
                                                                            AI
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <p className="text-sm">{item.author}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {CATEGORIES.find(c => c.id === item.category)?.name}
                                                                </p>
                                                            </td>
                                                            <td className="p-3">
                                                                <p className="text-sm">{item.views} views</p>
                                                                <p className="text-xs text-muted-foreground">{item.likes} likes</p>
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setContentToDelete(item)
                                                                        setDeleteDialogOpen(true)
                                                                    }}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="text-sm text-muted-foreground">
                                    Showing {filteredContent.length} of {content.length} items
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Settings Sidebar */}
                    <div className="space-y-6">
                        {/* Platform Settings */}
                        <Card className="glass-card border-none">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Settings className="w-5 h-5 mr-2" />
                                    Platform Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="ai-enabled" className="text-sm">AI Features</Label>
                                    <Switch
                                        id="ai-enabled"
                                        checked={settings.aiEnabled}
                                        onCheckedChange={(checked) => handleSettingsChange('aiEnabled', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="allow-videos" className="text-sm">Allow Videos</Label>
                                    <Switch
                                        id="allow-videos"
                                        checked={settings.allowVideos}
                                        onCheckedChange={(checked) => handleSettingsChange('allowVideos', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="allow-podcasts" className="text-sm">Allow Podcasts</Label>
                                    <Switch
                                        id="allow-podcasts"
                                        checked={settings.allowPodcasts}
                                        onCheckedChange={(checked) => handleSettingsChange('allowPodcasts', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="moderation" className="text-sm">Moderation</Label>
                                    <Switch
                                        id="moderation"
                                        checked={settings.moderationEnabled}
                                        onCheckedChange={(checked) => handleSettingsChange('moderationEnabled', checked)}
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <Label htmlFor="daily-limit" className="text-sm">Daily Post Limit</Label>
                                    <Input
                                        id="daily-limit"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={settings.dailyLimit}
                                        onChange={(e) => handleSettingsChange('dailyLimit', parseInt(e.target.value))}
                                        className="mt-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bulk Actions */}
                        <Card className="glass-card border-none border-red-200 bg-red-50/50 dark:bg-red-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    Danger Zone
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        setBulkDeleteType('ai')
                                        setBulkDeleteDialogOpen(true)
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete All AI Content
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        setBulkDeleteType('user')
                                        setBulkDeleteDialogOpen(true)
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete All User Content
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Content?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{contentToDelete?.headline}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteContent}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Dialog */}
            <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Delete Confirmation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete ALL {bulkDeleteType === 'ai' ? 'AI-generated' : 'user-created'} content?
                            This will permanently remove {bulkDeleteType === 'ai' ? stats.aiGenerated : stats.userGenerated} items.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleBulkDelete}>
                            Delete All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
