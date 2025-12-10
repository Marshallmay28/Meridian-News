'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Article as ArticleType, Comment, Settings, canEditArticle, formatDate, formatFullDate } from '@/lib/content-models'
import { useParams, useRouter } from 'next/navigation'
import { Search, Menu, Plus, Sun, Moon, Heart, MessageSquare, Share2, Clock, Calendar, User, ArrowLeft, Bookmark, TrendingUp, Send, X, Edit, Trash2, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Article = ArticleType

const getDeviceId = () => {
  if (typeof window === 'undefined') return 'server'
  let deviceId = localStorage.getItem('meridianDeviceId')
  if (!deviceId) {
    deviceId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
    localStorage.setItem('meridianDeviceId', deviceId)
  }
  return deviceId
}

const getArticles = (): Article[] => {
  if (typeof window === 'undefined') return []
  const articles = localStorage.getItem('meridianArticles')
  return articles ? JSON.parse(articles) : []
}

const saveArticles = (articles: Article[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('meridianArticles', JSON.stringify(articles))
  }
}

const getSettings = (): Settings => {
  if (typeof window === 'undefined') return {
    fontSize: 'medium',
    dailyCount: 0,
    lastPublished: '',
    savedArticles: [],
    readingHistory: []
  }
  const settings = localStorage.getItem('meridianSettings')
  return settings ? JSON.parse(settings) : {
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
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { aiGenerator, AIArticle } from '@/lib/ai-generator'

// Local interfaces and helpers removed in favor of imports from @/lib/content-models


import { useTheme } from 'next-themes'

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const paramsId = params.id
  const articleId = typeof paramsId === 'string' ? paramsId : Array.isArray(paramsId) ? paramsId[0] : ''
  const { isAdmin, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [article, setArticle] = useState<Article | null>(null)
  const [settings, setSettings] = useState<Settings>({
    fontSize: 'medium',
    dailyCount: 0,
    lastPublished: '',
    savedArticles: [],
    readingHistory: []
  })
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    headline: '',
    content: '',
    image: ''
  })

  useEffect(() => {
    // Load settings from localStorage after component mounts
    const loadedSettings = getSettings()
    setSettings(loadedSettings)

    // Fetch article - try database first, then localStorage
    const fetchArticle = async () => {
      try {
        // Try database first
        const response = await fetch(`/api/content/${articleId}`)
        if (response.ok) {
          const data = await response.json()
          const foundArticle = data.content

          if (foundArticle) {
            setArticle(foundArticle)
            setComments(foundArticle.comments || [])
            setEditForm({
              headline: foundArticle.headline,
              content: foundArticle.content,
              image: foundArticle.image || ''
            })

            // Add to reading history
            const updatedSettings = {
              ...loadedSettings,
              readingHistory: [articleId, ...loadedSettings.readingHistory.filter(id => id !== articleId)].slice(0, 50)
            }
            setSettings(updatedSettings)
            saveSettings(updatedSettings)
            return // Success, exit early
          }
        }
      } catch (error) {
        // Database fetch failed, proceed to localStorage fallback
      }

      // Fallback to localStorage (always runs if database fails or article not found in API)
      const articles = getArticles()
      const foundArticle = articles.find(a => a.id === articleId)

      if (foundArticle) {
        setArticle(foundArticle)
        setComments(foundArticle.comments || [])
        setEditForm({
          headline: foundArticle.headline,
          content: foundArticle.content,
          image: foundArticle.image || ''
        })

        // Add to reading history
        const updatedSettings = {
          ...loadedSettings,
          readingHistory: [articleId, ...loadedSettings.readingHistory.filter(id => id !== articleId)].slice(0, 50)
        }
        setSettings(updatedSettings)
        saveSettings(updatedSettings)
      } else {
        console.error('Article not found in database or localStorage')
      }
    }

    fetchArticle()
  }, [articleId, router])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const handleLike = () => {
    if (!article) return

    const articles = getArticles()
    const updatedArticles = articles.map(a =>
      a.id === articleId ? { ...a, likes: a.likes + 1 } : a
    )
    saveArticles(updatedArticles)
    setArticle({ ...article, likes: article.likes + 1 })
  }

  const handleSaveArticle = () => {
    if (!article) return

    const updatedSettings = {
      ...settings,
      savedArticles: settings.savedArticles.includes(articleId)
        ? settings.savedArticles.filter(id => id !== articleId)
        : [...settings.savedArticles, articleId]
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  const handleComment = () => {
    if (!article || !newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      author: commentAuthor || 'Anonymous Reader',
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0
    }

    const updatedComments = [...comments, comment]
    setComments(updatedComments)

    const articles = getArticles()
    const updatedArticles = articles.map(a =>
      a.id === articleId ? { ...a, comments: updatedComments } : a
    )
    saveArticles(updatedArticles)

    setNewComment('')
    setCommentAuthor('')
  }

  const handleEditArticle = () => {
    if (!article || !canEditArticle(article)) return

    const articles = getArticles()
    const updatedArticles = articles.map(a =>
      a.id === articleId ? {
        ...a,
        headline: editForm.headline,
        content: editForm.content,
        image: editForm.image || undefined
      } : a
    )
    saveArticles(updatedArticles)
    setArticle({
      ...article,
      headline: editForm.headline,
      content: editForm.content,
      image: editForm.image || undefined
    })
    setIsEditDialogOpen(false)
  }

  const handleDeleteArticle = async () => {
    if (!article || !canEditArticle(article, user)) return

    if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        if (isAdmin) {
          const response = await fetch(`/api/content/${articleId}`, { method: 'DELETE' })
          if (!response.ok) {
            throw new Error('Failed to delete from server')
          }
        }

        const articles = getArticles()
        const updatedArticles = articles.filter(a => a.id !== articleId)
        saveArticles(updatedArticles)
        router.push('/')
      } catch (error) {
        console.error('Delete error:', error)
        alert('Failed to delete article. Please try again.')
      }
    }
  }

  const getRelatedArticles = () => {
    const articles = getArticles()
    return articles
      .filter(a => a.id !== articleId && a.category === article?.category)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3)
  }

  const shareArticle = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.headline,
          text: article.content.substring(0, 200) + '...',
          url: window.location.href
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback to clipboard with error handling
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(window.location.href)
          alert('Article link copied to clipboard!')
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea')
          textArea.value = window.location.href
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          alert('Article link copied to clipboard!')
        }
      } catch (error) {
        console.error('Failed to copy article link:', error)
        alert('Failed to copy link. Please copy the URL manually.')
      }
    }
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading article...</p>
        </div>
      </div>
    )
  }

  const isSaved = settings.savedArticles.includes(articleId)
  const canEdit = article ? canEditArticle(article, user) : false
  const relatedArticles = getRelatedArticles()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-muted-foreground hover:text-primary text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <nav className="hidden md:flex items-center space-x-6">
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">World</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Politics</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Technology</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Business</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Opinion</button>
              </nav>
            </div>

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

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="text-muted-foreground hover:text-primary"
              >
                {!mounted ? (
                  <span className="w-4 h-4" />
                ) : theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveArticle}
                className="text-muted-foreground hover:text-primary"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={shareArticle}
                className="text-muted-foreground hover:text-primary"
              >
                <Share2 className="w-4 h-4" />
              </Button>

              {canEdit && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteArticle}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => router.push('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              Home
            </button>
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => router.push(`/?category=${article.category}`)}
              className="text-muted-foreground hover:text-foreground capitalize"
            >
              {article.category}
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground truncate max-w-xs">{article.headline}</span>
          </nav>
        </div>
      </div>

      {/* Main Article Layout */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">
            <article className="py-8">
              {/* Article Header */}
              <header className="mb-8">
                {article.isAI && (
                  <div className="mb-4">
                    <Badge variant="secondary" className="font-medium">
                      <Brain className="w-3 h-3 mr-1" />
                      AI Generated Article
                    </Badge>
                  </div>
                )}

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6 text-foreground">
                  {article.headline}
                </h1>

                <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground mb-6 pb-6 border-b">
                  <div className="flex items-center space-x-4 mb-2 lg:mb-0">
                    <span className="font-medium text-foreground">{article.author}</span>
                    <span>•</span>
                    <span>{formatFullDate(article.publishedAt)}</span>
                    <span>•</span>
                    <span>{article.readTime} min read</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span>{article.views} views</span>
                    <button
                      onClick={handleLike}
                      className="flex items-center space-x-1 hover:text-destructive transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{article.likes}</span>
                    </button>
                  </div>
                </div>
              </header>

              {/* Featured Image */}
              {article.image && (
                <div className="mb-8">
                  <img
                    src={article.image}
                    alt={article.headline}
                    className="w-full h-auto rounded-lg shadow-xl"
                  />
                </div>
              )}

              {/* Article Body - NYT Style Typography */}
              <div className={`font-serif text-foreground/90 leading-relaxed space-y-6 ${settings.fontSize === 'small' ? 'text-base' :
                settings.fontSize === 'large' ? 'text-xl' :
                  'text-lg'
                }`}>
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className={index === 0 ? 'first-letter:text-6xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:leading-none' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Article Footer */}
              <footer className="mt-12 pt-8 border-t">
                <div className="flex items-center justify-center space-x-6">
                  <Button
                    variant="outline"
                    onClick={handleLike}
                    className="flex items-center space-x-2"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{article.likes} Likes</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareArticle}
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleSaveArticle}
                    className="flex items-center space-x-2"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </Button>
                </div>
              </footer>
            </article>

            {/* Comments Section */}
            <section className="py-8 border-t">
              <h3 className="text-2xl font-serif font-bold mb-6 text-foreground">Comments ({comments.length})</h3>

              {/* Comment Form */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Input
                      placeholder="Your name (optional)"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="bg-background"
                    />
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="bg-background"
                    />
                    <Button
                      onClick={handleComment}
                      disabled={!newComment.trim()}
                      className="w-full sm:w-auto"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map(comment => (
                  <Card key={comment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {comment.author.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="font-medium text-foreground">{comment.author}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-foreground/90 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8 py-8">
              {/* Author Info */}
              <section className="border rounded-lg p-6 bg-card text-card-foreground">
                <h3 className="font-serif font-bold text-lg mb-3">About the Author</h3>
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>
                      {article.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-foreground">{article.author}</h4>
                    <p className="text-sm text-muted-foreground">Contributing Writer</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {article.isAI ? 'This article was generated by AI using advanced language models and current event data.' : 'A passionate writer sharing insights and perspectives on current events.'}
                </p>
              </section>

              {/* Article Details */}
              <section className="border rounded-lg p-6 bg-card text-card-foreground">
                <h3 className="font-serif font-bold text-lg mb-3">Article Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium capitalize text-foreground">{article.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span className="font-medium text-foreground">{formatFullDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Read Time</span>
                    <span className="font-medium text-foreground">{article.readTime} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-medium text-foreground">{article.views}</span>
                  </div>
                </div>
              </section>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <section className="border rounded-lg p-6 bg-card text-card-foreground">
                  <h3 className="font-serif font-bold text-lg mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.map(relatedArticle => (
                      <article
                        key={relatedArticle.id}
                        className="cursor-pointer group"
                        onClick={() => router.push(`/article/${relatedArticle.id}`)}
                      >
                        <h4 className="text-sm font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                          {relatedArticle.headline}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(relatedArticle.publishedAt)}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Newsletter */}
              <section className="bg-muted/30 border rounded-lg p-6">
                <h3 className="font-serif font-bold text-lg mb-3 text-foreground">Newsletter</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest news and insights delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-background"
                  />
                  <Button className="w-full">
                    Subscribe
                  </Button>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Make changes to your article. You can only edit articles within 24 hours of publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={editForm.headline}
                onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={10}
              />
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={editForm.image}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditArticle}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}