'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Zap, Settings, BarChart3, RefreshCw, Play, Save, TrendingUp, Globe, MessageSquare, Eye, Heart, Star, Target, Lightbulb, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { aiGenerator, AIArticle, AIConfig } from '@/lib/ai-generator'

interface Settings {
  theme: 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large'
  dailyCount: number
  lastPublished: string
  savedArticles: string[]
  readingHistory: string[]
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

const getAIConfig = (): AIConfig => {
  if (typeof window === 'undefined') return {
    dailyGenerationCount: 0,
    lastGeneration: new Date().toISOString(),
    nextGeneration: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    topicsCovered: [],
    generationHistory: [],
    userPreferences: {
      preferredCategories: ['all'],
      aiContentEnabled: true,
      aiDensity: 'balanced'
    }
  }
  
  const config = localStorage.getItem('meridianAIConfig')
  return config ? JSON.parse(config) : {
    dailyGenerationCount: 0,
    lastGeneration: new Date().toISOString(),
    nextGeneration: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    topicsCovered: [],
    generationHistory: [],
    userPreferences: {
      preferredCategories: ['all'],
      aiContentEnabled: true,
      aiDensity: 'balanced'
    }
  }
}

const saveAIConfig = (config: AIConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('meridianAIConfig', JSON.stringify(config))
  }
}

const getAIArticles = (): AIArticle[] => {
  if (typeof window === 'undefined') return []
  
  const articles = localStorage.getItem('meridianAIArticles')
  return articles ? JSON.parse(articles) : []
}

const saveAIArticles = (articles: AIArticle[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('meridianAIArticles', JSON.stringify(articles))
  }
}

export default function AILabPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    fontSize: 'medium',
    dailyCount: 0,
    lastPublished: '',
    savedArticles: [],
    readingHistory: []
  })
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    dailyGenerationCount: 0,
    lastGeneration: new Date().toISOString(),
    nextGeneration: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    topicsCovered: [],
    generationHistory: [],
    userPreferences: {
      preferredCategories: ['all'],
      aiContentEnabled: true,
      aiDensity: 'balanced'
    }
  })
  const [aiArticles, setAIArticles] = useState<AIArticle[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('random')
  const [generationCount, setGenerationCount] = useState(5)
  const [activeTab, setActiveTab] = useState('generate')

  useEffect(() => {
    const loadedSettings = getSettings()
    const loadedConfig = getAIConfig()
    const loadedArticles = getAIArticles()
    
    setSettings(loadedSettings)
    setAIConfig(loadedConfig)
    setAIArticles(loadedArticles)
  }, [])

  useEffect(() => {
    saveSettings(settings)
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  useEffect(() => {
    saveAIConfig(aiConfig)
  }, [aiConfig])

  const handleGenerateArticles = async () => {
    setIsGenerating(true)
    
    try {
      const newArticles = aiGenerator.generateMultipleArticles(generationCount)
      const updatedArticles = [...newArticles, ...aiArticles]
      
      setAIArticles(updatedArticles)
      saveAIArticles(updatedArticles)
      
      const updatedConfig = {
        ...aiConfig,
        dailyGenerationCount: aiConfig.dailyGenerationCount + generationCount,
        lastGeneration: new Date().toISOString(),
        nextGeneration: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        generationHistory: [
          ...aiConfig.generationHistory,
          {
            timestamp: new Date().toISOString(),
            category: selectedCategory,
            count: generationCount
          }
        ]
      }
      
      setAIConfig(updatedConfig)
      saveAIConfig(updatedConfig)
      
    } catch (error) {
      console.error('Failed to generate articles:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateBreakingNews = async () => {
    setIsGenerating(true)
    
    try {
      const breakingArticle = aiGenerator.generateBreakingNews()
      const updatedArticles = [breakingArticle, ...aiArticles]
      
      setAIArticles(updatedArticles)
      saveAIArticles(updatedArticles)
      
    } catch (error) {
      console.error('Failed to generate breaking news:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getTimeUntilNextGeneration = () => {
    const now = new Date().getTime()
    const nextTime = new Date(aiConfig.nextGeneration).getTime()
    const diff = nextTime - now
    
    if (diff <= 0) return 'Available now'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  const getCategoryDistribution = () => {
    const distribution: Record<string, number> = {}
    
    aiArticles.forEach(article => {
      distribution[article.category] = (distribution[article.category] || 0) + 1
    })
    
    return distribution
  }

  const categoryDistribution = getCategoryDistribution()
  const timeUntilNext = getTimeUntilNextGeneration()

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
                  ← Back to Home
                </Button>
                <div className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-serif font-bold text-black dark:text-white flex items-center">
                  <Brain className="w-6 h-6 mr-2" />
                  AI News Lab
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings({...settings, theme: settings.theme === 'light' ? 'dark' : 'light'})}
                >
                  {settings.theme === 'light' ? '🌙' : '☀️'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Status Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-green-600" />
                  AI System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Articles Today</span>
                    <span className="font-bold">{aiConfig.dailyGenerationCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Generation</span>
                    <span className="font-bold text-blue-600">{timeUntilNext}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quality Score</span>
                    <span className="font-bold">8.7/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engagement</span>
                    <span className="font-bold">74%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Diversity</span>
                    <span className="font-bold">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                  Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoryDistribution).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(count / Math.max(...Object.values(categoryDistribution))) * 100} className="w-16" />
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-orange-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleGenerateBreakingNews}
                  disabled={isGenerating}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Generate Breaking News
                </Button>
                <Button 
                  onClick={() => router.push('/publish')}
                  variant="outline"
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  AI-Assisted Writing
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-6 h-6 mr-2" />
                    AI Article Generator
                  </CardTitle>
                  <CardDescription>
                    Generate high-quality, human-like articles instantly with our advanced AI system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="random">🎲 Random Mix</SelectItem>
                          <SelectItem value="world">🌍 World News</SelectItem>
                          <SelectItem value="politics">🏛️ Politics</SelectItem>
                          <SelectItem value="technology">💻 Technology</SelectItem>
                          <SelectItem value="business">📈 Business</SelectItem>
                          <SelectItem value="sports">⚽ Sports</SelectItem>
                          <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
                          <SelectItem value="health">🏥 Health</SelectItem>
                          <SelectItem value="science">🔬 Science</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Number of Articles</label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          value={[generationCount]}
                          onValueChange={(value) => setGenerationCount(value[0])}
                          max={20}
                          min={1}
                          step={1}
                          className="flex-1"
                        />
                        <span className="font-bold text-lg w-12 text-center">{generationCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={handleGenerateArticles}
                      disabled={isGenerating}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate {generationCount} Articles
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/')}
                      variant="outline"
                    >
                      View Generated Articles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                  <CardDescription>
                    Customize how the AI generates content and what topics it covers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable AI Content</label>
                      <p className="text-sm text-muted-foreground">Allow AI to generate articles automatically</p>
                    </div>
                    <Switch
                      checked={aiConfig.userPreferences.aiContentEnabled}
                      onCheckedChange={(checked) => setAIConfig({
                        ...aiConfig,
                        userPreferences: {
                          ...aiConfig.userPreferences,
                          aiContentEnabled: checked
                        }
                      })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">AI Generation Density</label>
                    <Select 
                      value={aiConfig.userPreferences.aiDensity} 
                      onValueChange={(value: any) => setAIConfig({
                        ...aiConfig,
                        userPreferences: {
                          ...aiConfig.userPreferences,
                          aiDensity: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal (2-3 articles/day)</SelectItem>
                        <SelectItem value="balanced">Balanced (5-8 articles/day)</SelectItem>
                        <SelectItem value="frequent">Frequent (10-15 articles/day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Engagement Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Views</span>
                        <span className="font-bold">
                          {aiArticles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Likes</span>
                        <span className="font-bold">
                          {aiArticles.reduce((sum, article) => sum + article.likes, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg. Confidence</span>
                        <span className="font-bold">
                          {(aiArticles.reduce((sum, article) => sum + article.confidence, 0) / Math.max(aiArticles.length, 1) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Top Generated Articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiArticles.slice(0, 5).map((article, index) => (
                        <div key={article.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">{article.headline}</h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <span>{article.category}</span>
                              <span>•</span>
                              <span>{article.views} views</span>
                              <span>•</span>
                              <span>{article.likes} likes</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Recent AI Articles */}
          {aiArticles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-6 h-6 mr-2" />
                  Recently Generated AI Articles ({aiArticles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiArticles.slice(0, 9).map(article => (
                    <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-purple-100 text-purple-800 text-xs">AI Generated</Badge>
                        <span className="text-xs text-gray-500">{article.readTime} min read</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{article.headline}</h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-3">{article.summary}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{article.category}</span>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3" />
                          <span>{article.views}</span>
                          <Heart className="w-3 h-3" />
                          <span>{article.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t bg-gray-50 dark:bg-gray-900 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Brain className="w-4 h-4" />
                <span>AI-Powered News Generation</span>
              </div>
              <p className="text-xs text-gray-500">
                This platform uses artificial intelligence to generate news articles for demonstration purposes. 
                All AI-generated content is clearly labeled and intended for educational use only.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}