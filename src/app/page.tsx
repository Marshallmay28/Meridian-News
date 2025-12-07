'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Menu, Plus, Sun, Moon, TrendingUp, Clock, Heart, MessageSquare, Share2, Filter, Grid, List, ChevronRight, Calendar, User, Globe, Zap, BookOpen, Download, Upload, X, Brain, Video, Mic, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { aiGenerator, AIArticle } from '@/lib/ai-generator'
import { responsive, getResponsiveClasses, getResponsiveImageProps, getTouchSize } from '@/lib/responsive'
import { UTILITY_CLASSES } from '@/lib/styles'
import { Content, MediaType, getAllContent, CATEGORIES, getMediaIcon, getMediaTypeName, isVideo, isPodcast, isArticle, formatDuration, Settings } from '@/lib/content-models'

const generateDeviceId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

const getDeviceId = () => {
  let deviceId = localStorage.getItem('meridianDeviceId')
  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem('meridianDeviceId', deviceId)
  }
  return deviceId
}

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

const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
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
    // Load settings from localStorage after component mounts
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
    setContent(getAllContent())
  }, [])

  useEffect(() => {
    // Update publishing count when settings change
    setPublishingCount(getPublishingCount(settings))
  }, [settings])

  useEffect(() => {
    saveSettings(settings)
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const filteredContent = content.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesMediaType = selectedMediaType === 'all' || item.mediaType === selectedMediaType
    const matchesSearch = searchQuery === '' || 
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesMediaType && matchesSearch
  })

  const trendingContent = [...content]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)

  const latestContent = [...filteredContent]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const handleExport = () => {
    const dataStr = JSON.stringify(content, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `meridian-post-content-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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
        // Save to appropriate storage
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
      } catch (error) {
        alert('Invalid file format. Please upload a valid JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const getContentLink = (item: Content) => {
    if (isVideo(item)) {
      return `/video/${item.id}`
    } else if (isPodcast(item)) {
      return `/podcast/${item.id}`
    } else {
      return `/article/${item.id}`
    }
  }

  const getContentThumbnail = (item: Content) => {
    if (isVideo(item)) {
      return item.thumbnailUrl
    } else if (isPodcast(item)) {
      return item.coverImageUrl
    } else {
      return item.image
    }
  }

  const renderContentCard = (item: Content, size: 'large' | 'medium' | 'small' = 'medium') => {
    const thumbnail = getContentThumbnail(item)
    const isLarge = size === 'large'
    const isSmall = size === 'small'

    return (
      <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => router.push(getContentLink(item))}>
        {/* Media Type Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-black text-white text-xs">
            {getMediaIcon(item.mediaType)} {getMediaTypeName(item.mediaType)}
          </Badge>
        </div>

        {/* Thumbnail/Image */}
        {thumbnail && (
          <div className={`${isLarge ? 'aspect-video' : isSmall ? 'aspect-video' : 'aspect-video'} w-full overflow-hidden`}>
            <img
              src={thumbnail}
              alt={item.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <CardContent className="p-4">
          <div className="mb-2">
            {item.isAI && (
              <Badge className="bg-purple-100 text-purple-800 text-xs mb-1">
                <Brain className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {CATEGORIES.find(c => c.id === item.category)?.name}
            </Badge>
          </div>

          <h3 className={`${isLarge ? 'text-xl' : isSmall ? 'text-sm' : 'text-base'} font-serif font-bold text-black group-hover:text-blue-600 transition-colors mb-2 line-clamp-2`}>
            {item.headline}
          </h3>

          <p className={`${isSmall ? 'text-xs' : 'text-sm'} text-gray-700 mb-3 line-clamp-${isSmall ? '2' : '3'}`}>
            {item.content}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <span>By {item.author}</span>
              <span>•</span>
              <span>{formatDate(item.publishedAt)}</span>
              {isVideo(item) && (
                <>
                  <span>•</span>
                  <span>{formatDuration(item.duration)}</span>
                </>
              )}
              {isPodcast(item) && (
                <>
                  <span>•</span>
                  <span>{formatDuration(item.duration)}</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-3 h-3" />
              <span>{item.likes}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        {/* Header */}
        <header className="border-b bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <h1 className="text-3xl font-serif font-bold text-black dark:text-white">The Meridian Post</h1>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings({...settings, theme: settings.theme === 'light' ? 'dark' : 'light'})}
                >
                  {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/publish')}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Publish Content
                </Button>
                <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Sync
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sync Content</DialogTitle>
                      <DialogDescription>
                        Share articles, videos, and podcasts with others or import from the community.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Button onClick={handleExport} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Export All Content
                      </Button>
                      <div>
                        <Label htmlFor="import">Import Content</Label>
                        <Input
                          id="import"
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className={UTILITY_CLASSES.darkBg + ' border-b'}>
          <div className={UTILITY_CLASSES.fluidContainer}>
            <div className="flex items-center space-x-8 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={UTILITY_CLASSES.navLink}
              >
                Home
              </button>
              <button
                onClick={() => router.push('/categories')}
                className={UTILITY_CLASSES.navLink}
              >
                Categories
              </button>
              <button
                onClick={() => router.push('/ai-lab')}
                className={UTILITY_CLASSES.navLink + ' flex items-center space-x-1'}
              >
                <Brain className="w-4 h-4" />
                AI Lab
              </button>
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={UTILITY_CLASSES.navLink + ' flex items-center space-x-1'}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Search and Filters */}
        <div className={UTILITY_CLASSES.darkBg + ' border-b'}>
          <div className={UTILITY_CLASSES.fluidContainer}>
            <div className="flex items-center space-x-4 py-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles, videos, podcasts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
              
              {/* Media Type Filter */}
              <Select value={selectedMediaType} onValueChange={(value: MediaType | 'all') => setSelectedMediaType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Media" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Media</SelectItem>
                  <SelectItem value="article">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Articles</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center space-x-2">
                      <Video className="w-4 h-4" />
                      <span>Videos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="podcast">
                    <div className="flex items-center space-x-2">
                      <Mic className="w-4 h-4" />
                      <span>Podcasts</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Featured Story */}
              {latestContent.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-serif font-bold mb-6">Featured Story</h2>
                  <article className="cursor-pointer group" onClick={() => router.push(getContentLink(latestContent[0]))}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="aspect-video overflow-hidden rounded-lg">
                        <img
                          src={getContentThumbnail(latestContent[0]) || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'}
                          alt={latestContent[0].headline}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="mb-4">
                          <Badge className="bg-black text-white text-xs mb-2">
                            {getMediaIcon(latestContent[0].mediaType)} {getMediaTypeName(latestContent[0].mediaType)}
                          </Badge>
                          {latestContent[0].isAI && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs ml-2">
                              <Brain className="w-3 h-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        <h2 className="text-4xl font-serif font-bold mb-3 text-black group-hover:text-blue-600 transition-colors">
                          {latestContent[0].headline}
                        </h2>
                        <p className="text-lg text-gray-700 mb-4 leading-relaxed line-clamp-3">
                          {latestContent[0].content}
                        </p>
                        <div className="text-sm text-gray-600 font-medium">
                          <span>By {latestContent[0].author}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(latestContent[0].publishedAt)}</span>
                          {(isVideo(latestContent[0]) || isPodcast(latestContent[0])) && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{formatDuration(latestContent[0].duration)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </section>
              )}

              {/* Latest Content Grid */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold">Latest Content</h2>
                  <Button variant="outline" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latestContent.slice(0, 9).map(item => renderContentCard(item))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Publishing Status */}
              <Card className={UTILITY_CLASSES.cardHover}>
                <CardHeader>
                  <CardTitle className="text-lg">Publishing Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Today's Posts</span>
                      <span className="text-sm font-medium">{publishingCount.count}/3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(publishingCount.count / 3) * 100}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600">
                        {publishingCount.remaining} posts remaining today
                      </span>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => router.push('/publish')} 
                      disabled={publishingCount.remaining === 0}
                    >
                      {publishingCount.remaining > 0 ? 'Publish Content' : 'Daily Limit Reached'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Content */}
              <Card className={UTILITY_CLASSES.cardHover + ' mt-6'}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Trending Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {trendingContent.map((item, index) => (
                      <li key={item.id} className="flex items-start space-x-3">
                        <span className="text-lg font-bold text-gray-400">
                          {index + 1}
                        </span>
                        <article className="cursor-pointer group flex-1" onClick={() => router.push(getContentLink(item))}>
                          <div className="flex items-center space-x-2 mb-1">
                            {getMediaIcon(item.mediaType)}
                            <span className="text-xs text-gray-500">{getMediaTypeName(item.mediaType)}</span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {item.headline}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(item.publishedAt)}
                          </p>
                        </article>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card className={UTILITY_CLASSES.cardHover + ' mt-6'}>
                <CardHeader>
                  <CardTitle className="text-lg">Stay Updated</CardTitle>
                  <CardDescription>
                    Get the latest content delivered to your inbox
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input placeholder="Enter your email" type="email" />
                    <Button className="w-full">Subscribe</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* More Content Section */}
          {latestContent.length > 9 && (
            <section className="mt-16">
              <h2 className="text-2xl font-serif font-bold mb-6">More Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestContent.slice(9).map(item => renderContentCard(item))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t bg-gray-50 dark:bg-gray-900 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-serif font-bold text-lg mb-4">The Meridian Post</h3>
                <p className="text-sm text-gray-600">
                  A completely open platform where anyone can publish articles, videos, and podcasts without barriers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Content</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Articles</li>
                  <li>Videos</li>
                  <li>Podcasts</li>
                  <li>AI Generated Content</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Publish Instantly</li>
                  <li>No Registration</li>
                  <li>Multiple Media Types</li>
                  <li>Export/Import Content</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Share</h4>
                <Button onClick={handleExport} variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Content
                </Button>
              </div>
            </div>
            <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
              <p>© 2024 The Meridian Post. Free and open for everyone.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}