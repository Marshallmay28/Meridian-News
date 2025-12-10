'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Moon, Sun, Brain, Video, Mic, FileText, ArrowLeft, Sparkles, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Content, MediaType, getAllContent, CATEGORIES, formatDate, Settings } from '@/lib/content-models'
import { motion } from 'framer-motion'
import { AIContentGenerator } from '@/components/ai/AIContentGenerator'
import { useTheme } from 'next-themes'

const getSettings = (): Settings => {
  if (typeof window === 'undefined') return {
    fontSize: 'medium',
    dailyCount: 0,
    lastPublished: '',
    savedArticles: [],
    readingHistory: []
  }

  const settings = localStorage.getItem('meridianSettings')
  const parsedSettings = settings ? JSON.parse(settings) : {}
  return {
    fontSize: parsedSettings.fontSize || 'medium',
    dailyCount: parsedSettings.dailyCount || 0,
    lastPublished: parsedSettings.lastPublished || '',
    savedArticles: parsedSettings.savedArticles || [],
    readingHistory: parsedSettings.readingHistory || []
  }
}

const saveSettings = (settings: Settings) => {
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('meridianSettings')
    const parsed = existing ? JSON.parse(existing) : {}
    localStorage.setItem('meridianSettings', JSON.stringify({ ...parsed, ...settings }))
  }
}

export default function AILabPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [content, setContent] = useState<Content[]>([])
  const [settings, setSettings] = useState<Settings>(getSettings())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadContent = async () => {
    try {
      // Add cache busting to ensure fresh data
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/content?_t=${timestamp}`)
      if (response.ok) {
        const data = await response.json()
        const aiContent = (data.content || []).filter((item: Content) => item.isAI)
        setContent(aiContent)
      } else {
        setContent([])
      }
    } catch (error) {
      setContent([])
    }
  }

  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
    loadContent()
  }, [])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const filteredContent = content.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesMediaType = selectedMediaType === 'all' || item.mediaType === selectedMediaType
    const matchesSearch = searchQuery === '' ||
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesMediaType && matchesSearch
  })

  const getContentLink = (item: Content) => {
    if (item.mediaType === 'video') return `/video/${item.id}`
    if (item.mediaType === 'podcast') return `/podcast/${item.id}`
    return `/article/${item.id}`
  }

  const getContentThumbnail = (item: Content) => {
    if (item.mediaType === 'video') return (item as any).thumbnailUrl
    if (item.mediaType === 'podcast') return (item as any).coverImageUrl
    return (item as any).image
  }

  const getMediaIcon = (mediaType: MediaType) => {
    switch (mediaType) {
      case 'video': return <Video className="w-3 h-3" />
      case 'podcast': return <Mic className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20 text-foreground transition-colors duration-300">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-purple-200/40 dark:border-purple-800/40 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Left */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            {/* Center - Brand */}
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

            {/* Right - Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/20"
              >
                {!mounted ? (
                  <span className="w-4 h-4" />
                ) : theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-purple-200/40 dark:border-purple-800/40 bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI-Generated Content</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold">
              Explore AI-Powered Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover articles, videos, and podcasts created by advanced AI. Every piece is generated with creativity and precision.
            </p>
            <div className="flex items-center justify-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{content.length}</div>
                <div className="text-sm text-muted-foreground">AI Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{content.filter(c => c.mediaType === 'video').length}</div>
                <div className="text-sm text-muted-foreground">AI Videos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{content.filter(c => c.mediaType === 'podcast').length}</div>
                <div className="text-sm text-muted-foreground">AI Podcasts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">

        {/* AI Generator */}
        <section className="mb-12">
          <AIContentGenerator onGenerated={loadContent} />
        </section>

        {/* Search & Filters */}
        <section className="mb-12">
          <div className="glass-card p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto shadow-xl shadow-purple-500/10">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search AI-generated content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-none bg-transparent shadow-none focus-visible:ring-0 text-lg h-12"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto px-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[140px] border-none bg-secondary/50 rounded-xl h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMediaType} onValueChange={(value: MediaType | 'all') => setSelectedMediaType(value)}>
                <SelectTrigger className="w-full md:w-[140px] border-none bg-secondary/50 rounded-xl h-10">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="podcast">Podcasts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section>
          {filteredContent.length === 0 ? (
            <div className="text-center py-20">
              <Brain className="w-16 h-16 mx-auto text-purple-300 mb-4" />
              <h3 className="text-2xl font-serif font-bold mb-2">No AI Content Yet</h3>
              <p className="text-muted-foreground">AI-generated articles will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredContent.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="glass-card overflow-hidden group border-none h-full flex flex-col cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
                    onClick={() => router.push(getContentLink(item))}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      <div className="absolute top-3 left-3 z-10 flex gap-2">
                        <Badge className="bg-purple-600/90 backdrop-blur-sm text-white border-none shadow-sm">
                          <Brain className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                        <Badge className="bg-black/70 backdrop-blur-sm text-white hover:bg-black/80 border-none">
                          {getMediaIcon(item.mediaType)}
                          <span className="ml-1">{item.mediaType}</span>
                        </Badge>
                      </div>

                      {getContentThumbnail(item) ? (
                        <img
                          src={getContentThumbnail(item)}
                          alt={item.headline}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="mb-2">
                        <span className="text-xs font-semibold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
                          {CATEGORIES.find(c => c.id === item.category)?.name}
                        </span>
                      </div>

                      <h3 className="text-lg font-serif font-bold mb-2 group-hover:text-purple-600 transition-colors line-clamp-2 leading-tight">
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
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{item.likes}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-secondary/20 mt-20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            All content on this page is generated by AI • Powered by Meridian Post
          </p>
        </div>
      </footer>
    </div>
  )
}