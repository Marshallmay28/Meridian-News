'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Moon, Sun, TrendingUp, Filter, Grid, List, ChevronRight, Brain, Video, Mic, FileText, Download, Upload, Plus, Heart, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Content, MediaType, getAllContent, CATEGORIES, getMediaIcon, getMediaTypeName, isVideo, isPodcast, isArticle, formatDuration, Settings } from '@/lib/content-models'
import { UTILITY_CLASSES } from '@/lib/styles'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { UserProfile } from '@/components/auth/UserProfile'

// ... Keep existing utility functions ...
const getSettings = (): Settings => {
  if (typeof window === 'undefined') return {
    theme: 'light',
    fontSize: 'medium',
    dailyCount: 0,
    lastPublished: '',
    savedArticles: [],
    readingHistory: []
  }

  const settings = localStorage.getItem('meridianSettings')
  return settings ? JSON.parse(settings) : {
    theme: 'light',
    fontSize: 'medium',
    dailyCount: 0,
    lastPublished: '',
    savedArticles: [],
    readingHistory: []
  }
}

const saveSettings = (settings: Settings) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('meridianSettings', JSON.stringify(settings))
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)

  if (hours < 1) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} minutes ago`
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

const getPublishingCount = (settings: Settings): { count: number; remaining: number } => {
  const today = new Date().toDateString()

  if (settings.lastPublished !== today) {
    return { count: 0, remaining: 3 }
  }

  return {
    count: settings.dailyCount,
    remaining: 3 - settings.dailyCount
  }
}

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const [content, setContent] = useState<Content[]>([])
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    fontSize: 'medium',
    dailyCount: 0,
    lastPublished: '',
    savedArticles: [],
    readingHistory: []
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const [publishingCount, setPublishingCount] = useState({ count: 0, remaining: 3 })

  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)

    // Load content from database ONLY
    const loadContent = async () => {
      try {
        // Add cache busting to ensure fresh data
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/content?_t=${timestamp}`)
        if (response.ok) {
          const data = await response.json()
          setContent(data.content || [])
        } else {
          console.error('Failed to load content from database')
          setContent([]) // Show empty if database fails
        }
      } catch (error) {
        console.error('Error loading content:', error)
        setContent([]) // Show empty if error
      }
    }

    loadContent()
    setPublishingCount(getPublishingCount(loadedSettings))
  }, [])

  useEffect(() => {
    saveSettings(settings)
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const filteredContent = content.filter(item => {
    // Filter out AI-generated content from home page
    if (item.isAI) return false

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesMediaType = selectedMediaType === 'all' || item.mediaType === selectedMediaType
    const matchesSearch = searchQuery === '' ||
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesMediaType && matchesSearch
  })

  const trendingContent = [...content.filter(c => !c.isAI)]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)

  const latestContent = [...filteredContent]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(content, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const exportFileDefaultName = `meridian-post-content-${new Date().toISOString().split('T')[0]}.json`

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      toast.success('Content exported successfully')
    } catch (error) {
      toast.error('Failed to export content')
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedContent = JSON.parse(e.target?.result as string)
        const mergedContent = [...importedContent, ...content]
          .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

        setContent(mergedContent)

        // Save to appropriate local storage keys
        importedContent.forEach((item: Content) => {
          const storageKey = item.mediaType === 'video' ? 'meridianVideos' :
            item.mediaType === 'podcast' ? 'meridianPodcasts' :
              'meridianArticles'
          const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]')
          const updatedData = existingData.some((existing: Content) => existing.id === item.id)
            ? existingData.map((existing: Content) => existing.id === item.id ? item : existing)
            : [...existingData, item]
          localStorage.setItem(storageKey, JSON.stringify(updatedData))
        })

        setIsSyncDialogOpen(false)
        toast.success('Content imported successfully')
      } catch (error) {
        toast.error('Invalid file format. Please upload a valid JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const getContentLink = (item: Content) => {
    if (isVideo(item)) return `/video/${item.id}`
    if (isPodcast(item)) return `/podcast/${item.id}`
    return `/article/${item.id}`
  }

  const getContentThumbnail = (item: Content) => {
    if (isVideo(item)) return item.thumbnailUrl
    if (isPodcast(item)) return item.coverImageUrl
    return item.image
  }

  const renderContentCard = (item: Content, size: 'large' | 'medium' | 'small' = 'medium') => {
    const thumbnail = getContentThumbnail(item)
    const isLarge = size === 'large'
    const isSmall = size === 'small'

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => router.push(getContentLink(item))}
        className="cursor-pointer"
      >
        <Card className="glass-card overflow-hidden group border-none h-full flex flex-col">

          {/* Thumbnail Container */}
          <div className="relative aspect-video overflow-hidden">
            <div className="absolute top-3 left-3 z-10 flex gap-2">
              <Badge className="bg-black/70 backdrop-blur-sm text-white hover:bg-black/80 transition-colors border-none shadow-sm">
                {getMediaIcon(item.mediaType)}
                <span className="ml-1">{getMediaTypeName(item.mediaType)}</span>
              </Badge>
              {item.isAI && (
                <Badge className="bg-purple-600/90 backdrop-blur-sm text-white border-none shadow-sm">
                  <Brain className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>

            {thumbnail ? (
              <img
                src={thumbnail}
                alt={item.headline}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <CardContent className="p-5 flex-1 flex flex-col">
            <div className="mb-2">
              <span className="text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                {CATEGORIES.find(c => c.id === item.category)?.name}
              </span>
            </div>

            <h3 className={`${isLarge ? 'text-2xl' : 'text-lg'} font-serif font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight`}>
              {item.headline}
            </h3>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1 leading-relaxed">
              {item.content}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center space-x-3">
                <span className="font-medium">{item.author}</span>
                <span>•</span>
                <span>{formatDate(item.publishedAt)}</span>
              </div>

              <div className="flex items-center space-x-3">
                {(isVideo(item) || isPodcast(item)) && (
                  <span className="bg-secondary px-2 py-0.5 rounded-full">
                    {formatDuration(item.duration)}
                  </span>
                )}
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{item.likes}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark' : ''} bg-background selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100`}>

      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/40 transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-serif font-bold tracking-tight">Meridian Post</h1>
                  <p className="text-xs text-muted-foreground">AI-Powered News</p>
                </div>
                <h1 className="text-base font-serif font-bold tracking-tight sm:hidden">Meridian</h1>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })}
                className="rounded-full hover:bg-secondary transition-colors h-8 w-8 sm:h-10 sm:w-10"
              >
                {settings.theme === 'light' ? <Moon className="w-3 h-3 sm:w-4 sm:h-4" /> : <Sun className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>

              <Button
                onClick={() => router.push('/publish')}
                size="sm"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all font-medium hidden sm:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Publish
              </Button>

              <Button
                onClick={() => router.push('/publish')}
                size="icon"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg sm:hidden h-8 w-8"
              >
                <Plus className="w-3 h-3" />
              </Button>

              <UserProfile />

              <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full hidden sm:flex h-8 w-8 sm:h-10 sm:w-10">
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Sync Content</DialogTitle>
                    <DialogDescription>
                      Backup your articles or import content from the community.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="bg-secondary/50 p-4 rounded-lg border border-border/50">
                      <Button onClick={handleExport} className="w-full mb-3" variant="default">
                        <Download className="w-4 h-4 mr-2" />
                        Export Backup
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Downloads a JSON file of all your local content
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or import</span>
                      </div>
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="import">Import Backup File</Label>
                      <Input
                        id="import"
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="cursor-pointer file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-1 overflow-x-auto py-2 no-scrollbar">
            <Button
              variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="rounded-full font-medium"
            >
              For You
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/ai-lab')}
              className="rounded-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Lab
            </Button>
            {CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">

        {/* Search & Filters */}
        <section className="mb-12">
          <div className="glass-card p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto shadow-xl shadow-black/5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search stories, ideas, and voices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-none bg-transparent shadow-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/70 h-12"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto px-2">
              <Select value={selectedMediaType} onValueChange={(value: MediaType | 'all') => setSelectedMediaType(value)}>
                <SelectTrigger className="w-full md:w-[140px] border-none bg-secondary/50 hover:bg-secondary transition-colors rounded-xl h-10 font-medium">
                  <SelectValue placeholder="All Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="podcast">Podcasts</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex bg-secondary/50 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-lg h-8 w-8 shadow-sm"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-lg h-8 w-8"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-12">

            {/* Featured Story */}
            {latestContent.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-2xl overflow-hidden mb-12 shadow-2xl group cursor-pointer"
                onClick={() => router.push(getContentLink(latestContent[0]))}
              >
                <div className="aspect-[2/1] rounded-3xl overflow-hidden relative shadow-2xl">
                  <img
                    src={getContentThumbnail(latestContent[0]) || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07'}
                    alt={latestContent[0].headline}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20">
                        {getMediaIcon(latestContent[0].mediaType)} <span className="ml-2">{getMediaTypeName(latestContent[0].mediaType)}</span>
                      </Badge>
                      <span className="text-sm font-medium tracking-wide uppercase text-white/80">
                        {CATEGORIES.find(c => c.id === latestContent[0].category)?.name}
                      </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight">
                      {latestContent[0].headline}
                    </h2>

                    <p className="text-lg text-white/80 line-clamp-2 max-w-2xl mb-4 font-light leading-relaxed">
                      {latestContent[0].content}
                    </p>

                    <div className="flex items-center text-sm font-medium text-white/70 space-x-4">
                      <span>By {latestContent[0].author}</span>
                      <span>•</span>
                      <span>{formatDate(latestContent[0].publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Latest Grid */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif font-bold flex items-center">
                  Latest Stories
                </h2>
                <Button variant="outline" className="rounded-full">
                  View Archive <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 gap-8' : 'grid-cols-1 gap-6'}`}>
                {latestContent.slice(1, 9).map(item => renderContentCard(item))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Publisher Stats Widget */}
            <Card className="glass-card border-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />

              <CardHeader className="relative">
                <CardTitle className="text-xl font-serif flex items-center justify-between">
                  <span>Daily Publisher</span>
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                </CardTitle>
                <div className="glass-card p-6 rounded-2xl border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Daily Publishing</h3>
                      <p className="text-sm text-muted-foreground">Track your content creation</p>
                    </div>
                    <div className="text-right">
                      {(session?.user as any)?.role === 'admin' ? (
                        <>
                          <div className="text-2xl font-bold text-purple-600">∞</div>
                          <p className="text-xs text-purple-600">Unlimited (Admin)</p>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">
                            <span>{publishingCount.count}/3</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Articles Today</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(session?.user as any)?.role !== 'admin' && (
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-600 transition-all"
                          style={{ width: `${(publishingCount.count / 3) * 100}%` }}
                        />
                      </div>
                    )}
                    <Button
                      onClick={() => router.push('/publish')}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={(session?.user as any)?.role !== 'admin' && publishingCount.remaining === 0}
                    >
                      {(session?.user as any)?.role === 'admin' ? 'Start Writing (Unlimited)' : publishingCount.remaining > 0 ? 'Start Writing' : 'Limit Reached'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-6">
              </CardContent>
            </Card>

            {/* Trending List */}
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trendingContent.map((item, index) => (
                    <article
                      key={item.id}
                      className="flex items-start space-x-4 cursor-pointer group"
                      onClick={() => router.push(getContentLink(item))}
                    >
                      <span className="text-4xl font-black text-secondary/60 leading-none -mt-1 font-serif">
                        {index + 1}
                      </span>
                      <div className="flex-1 border-b border-border/40 pb-4 group-last:border-0 group-last:pb-0">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
                          {getMediaIcon(item.mediaType)}
                          <span className="uppercase tracking-wide font-semibold">{CATEGORIES.find(c => c.id === item.category)?.name}</span>
                        </div>
                        <h4 className="font-serif font-bold group-hover:text-blue-600 transition-colors leading-snug">
                          {item.headline}
                        </h4>
                      </div>
                    </article>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="glass-card border-none bg-secondary/30">
              <CardHeader>
                <CardTitle className="font-serif">The Daily Brief</CardTitle>
                <CardDescription>
                  Essential stories, expert analysis, and exclusive content delivered straight to your inbox.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="name@example.com" className="bg-background/50 border-transparent focus:bg-background" />
                <Button className="w-full">Subscribe</Button>
                <p className="text-xs text-muted-foreground text-center">
                  No spam, unsubscribe anytime.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-secondary/20 mt-20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">Meridian.</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Democratizing journalism with AI-powered tools and an open platform for all voices. Created by Forsight Group in 2025.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-blue-600 transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-blue-600 transition-colors">Contact</a></li>
                <li><a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/publish" className="hover:text-blue-600 transition-colors">Publishing</a></li>
                <li><a href="/ai-lab" className="hover:text-blue-600 transition-colors">AI Lab</a></li>
                <li><a href="/contact" className="hover:text-blue-600 transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Actions</h4>
              <Button variant="outline" size="sm" onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© 2025 The Meridian Post by Forsight Group. Open Source Journalism.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="hover:text-foreground cursor-pointer">Privacy</span>
              <span className="hover:text-foreground cursor-pointer">Terms</span>
              <span className="hover:text-foreground cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}