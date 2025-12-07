'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Menu, Sun, Moon, Globe, User, Zap, TrendingUp, BookOpen, MessageSquare, ArrowLeft, Grid, List, Filter, Calendar, Eye, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Article {
  id: string
  headline: string
  content: string
  author: string
  category: string
  image?: string
  publishedAt: string
  views: number
  likes: number
  comments: any[]
  readTime: number
  deviceId: string
}

interface Settings {
  theme: 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large'
  dailyCount: number
  lastPublished: string
  savedArticles: string[]
  readingHistory: string[]
}

const CATEGORIES = [
  { 
    id: 'world', 
    name: 'World', 
    icon: Globe, 
    description: 'International news and global events affecting our world',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  { 
    id: 'politics', 
    name: 'Politics', 
    icon: User, 
    description: 'Political news, elections, and government affairs',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },
  { 
    id: 'technology', 
    name: 'Technology', 
    icon: Zap, 
    description: 'Latest tech innovations, AI, and digital transformation',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  { 
    id: 'business', 
    name: 'Business', 
    icon: TrendingUp, 
    description: 'Market news, economy, and business insights',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  { 
    id: 'sports', 
    name: 'Sports', 
    icon: Zap, 
    description: 'Sports news, scores, and athletic achievements',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  },
  { 
    id: 'entertainment', 
    name: 'Entertainment', 
    icon: BookOpen, 
    description: 'Arts, culture, movies, and entertainment news',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
  },
  { 
    id: 'local', 
    name: 'Local', 
    icon: Globe, 
    description: 'Community news and local happenings',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  { 
    id: 'opinion', 
    name: 'Opinion', 
    icon: MessageSquare, 
    description: 'Editorials, opinions, and thought-provoking commentary',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  }
]

const getArticles = (): Article[] => {
  if (typeof window === 'undefined') return []
  
  const articles = localStorage.getItem('meridianArticles')
  return articles ? JSON.parse(articles) : []
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

export default function CategoriesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    fontSize: 'medium',
    dailyCount: 0,
    lastPublished: '',
    savedArticles: [],
    readingHistory: []
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'most-liked'>('latest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    // Load settings and articles from localStorage after component mounts
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
    setArticles(getArticles())
  }, [])

  useEffect(() => {
    saveSettings(settings)
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesCategory
  })

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.views - a.views
      case 'most-liked':
        return b.likes - a.likes
      case 'latest':
      default:
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    }
  })

  const getCategoryStats = (categoryId: string) => {
    const categoryArticles = articles.filter(a => a.category === categoryId)
    const totalViews = categoryArticles.reduce((sum, a) => sum + a.views, 0)
    const totalLikes = categoryArticles.reduce((sum, a) => sum + a.likes, 0)
    return {
      count: categoryArticles.length,
      views: totalViews,
      likes: totalLikes,
      latest: categoryArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0]
    }
  }

  const allCategoriesWithStats = CATEGORIES.map(category => ({
    ...category,
    stats: getCategoryStats(category.id)
  }))

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        {/* Header */}
        <header className="border-b bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <div className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-serif font-bold text-black dark:text-white">Categories</h1>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings({...settings, theme: settings.theme === 'light' ? 'dark' : 'light'})}
                >
                  {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Category Overview */}
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold mb-8">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allCategoriesWithStats.map(category => (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <category.icon className="w-8 h-8 text-blue-600" />
                      <Badge className={category.color}>
                        {category.stats.count}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{category.stats.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{category.stats.likes}</span>
                        </div>
                      </div>
                    </div>
                    {category.stats.latest && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-1">Latest:</p>
                        <p className="text-sm font-medium line-clamp-2 hover:text-blue-600">
                          {category.stats.latest.headline}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <h3 className="text-xl font-semibold">
                {selectedCategory === 'all' ? 'All Articles' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
                <span className="text-sm text-gray-500 ml-2">({sortedArticles.length})</span>
              </h3>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <category.icon className="w-4 h-4" />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Viewed</SelectItem>
                  <SelectItem value="most-liked">Most Liked</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Articles Grid/List */}
          {sortedArticles.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {sortedArticles.map(article => (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => router.push(`/article/${article.id}`)}
                >
                  {article.image && (
                    <div className="aspect-video w-full">
                      <img
                        src={article.image}
                        alt={article.headline}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORIES.find(c => c.id === article.category)?.name}
                      </Badge>
                      <span className="text-xs text-gray-500">{article.readTime} min read</span>
                    </div>
                    
                    <h3 className="text-lg font-serif font-semibold mb-3 line-clamp-2">
                      {article.headline}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {article.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{article.likes}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                {selectedCategory === 'all' 
                  ? 'No articles have been published yet. Be the first to share a story!'
                  : `No articles in ${CATEGORIES.find(c => c.id === selectedCategory)?.name} yet.`
                }
              </p>
              <Button onClick={() => router.push('/publish')}>
                Publish First Article
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}