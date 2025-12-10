'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Search, Menu, Plus, Sun, Moon, Heart, MessageSquare, Share2, Clock, Calendar, User, ArrowLeft, Bookmark, TrendingUp, Send, X, Edit, Trash2, Brain, Play, Pause, Volume2, SkipForward, SkipBack, FileAudio, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/auth-context'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Slider } from '@/components/ui/slider'
import { Podcast as PodcastType, Comment, Settings, formatDuration, formatDate, formatFullDate, canEditPodcast } from '@/lib/content-models'

const getDeviceId = () => {
  let deviceId = localStorage.getItem('meridianDeviceId')
  if (!deviceId) {
    deviceId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
    localStorage.setItem('meridianDeviceId', deviceId)
  }
  return deviceId
}

const getPodcasts = (): PodcastType[] => {
  if (typeof window === 'undefined') return []

  const podcasts = localStorage.getItem('meridianPodcasts')
  return podcasts ? JSON.parse(podcasts) : []
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

const savePodcasts = (podcasts: PodcastType[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('meridianPodcasts', JSON.stringify(podcasts))
  }
}

export default function PodcastPage() {
  const params = useParams()
  const router = useRouter()
  const podcastId = params.id as string
  const { isAdmin, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [podcast, setPodcast] = useState<PodcastType | null>(null)
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
    audioUrl: '',
    coverImageUrl: '',
    description: '',
    transcript: ''
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(75)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showTranscript, setShowTranscript] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)

    const fetchPodcast = async () => {
      try {
        // Try database first
        const response = await fetch(`/api/content/${podcastId}`)
        if (response.ok) {
          const data = await response.json()
          const foundPodcast = data.content

          if (foundPodcast) {
            setPodcast(foundPodcast)
            setComments(foundPodcast.comments || [])
            setEditForm({
              headline: foundPodcast.headline,
              content: foundPodcast.content,
              audioUrl: foundPodcast.audioUrl || '',
              coverImageUrl: foundPodcast.coverImageUrl || '',
              description: foundPodcast.description || '',
              transcript: foundPodcast.transcript || foundPodcast.content
            })

            // Update view count locally (API already did it)
            setPodcast(prev => prev ? { ...prev, views: (foundPodcast.views || 0) } : foundPodcast)

            // Add to reading history
            const updatedSettings = {
              ...loadedSettings,
              readingHistory: [podcastId, ...loadedSettings.readingHistory.filter(id => id !== podcastId)].slice(0, 50)
            }
            setSettings(updatedSettings)
            saveSettings(updatedSettings)
            return // Success
          }
        }
      } catch (error) {
        console.error('Error fetching podcast from API:', error)
      }

      // Fallback to localStorage
      const podcasts = getPodcasts()
      const foundPodcast = podcasts.find(p => p.id === podcastId)

      if (foundPodcast) {
        setPodcast(foundPodcast)
        setComments(foundPodcast.comments)
        setEditForm({
          headline: foundPodcast.headline,
          content: foundPodcast.content,
          audioUrl: foundPodcast.audioUrl,
          coverImageUrl: foundPodcast.coverImageUrl,
          description: foundPodcast.description || '',
          transcript: foundPodcast.transcript || foundPodcast.content
        })

        // Update view count
        const updatedPodcasts = podcasts.map(p =>
          p.id === podcastId ? { ...p, views: p.views + 1 } : p
        )
        savePodcasts(updatedPodcasts)
        setPodcast({ ...foundPodcast, views: foundPodcast.views + 1 })

        // Add to reading history
        const updatedSettings = {
          ...loadedSettings,
          readingHistory: [podcastId, ...loadedSettings.readingHistory.filter(id => id !== podcastId)].slice(0, 50)
        }
        setSettings(updatedSettings)
        saveSettings(updatedSettings)
      } else {
        console.error('Podcast not found in database or localStorage')
        // router.push('/')
      }
    }

    fetchPodcast()
  }, [podcastId])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const handleLike = () => {
    if (!podcast) return

    const podcasts = getPodcasts()
    const updatedPodcasts = podcasts.map(p =>
      p.id === podcastId ? { ...p, likes: p.likes + 1 } : p
    )
    savePodcasts(updatedPodcasts)
    setPodcast({ ...podcast, likes: podcast.likes + 1 })
  }

  const handleSavePodcast = () => {
    if (!podcast) return

    const updatedSettings = {
      ...settings,
      savedArticles: settings.savedArticles.includes(podcastId)
        ? settings.savedArticles.filter(id => id !== podcastId)
        : [...settings.savedArticles, podcastId]
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  const handleComment = () => {
    if (!podcast || !newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      author: commentAuthor || 'Anonymous Listener',
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0
    }

    const updatedComments = [...comments, comment]
    setComments(updatedComments)

    const podcasts = getPodcasts()
    const updatedPodcasts = podcasts.map(p =>
      p.id === podcastId ? { ...p, comments: updatedComments } : p
    )
    savePodcasts(updatedPodcasts)

    setNewComment('')
    setCommentAuthor('')
  }

  const handleEditPodcast = () => {
    if (!podcast || !canEditPodcast(podcast)) return

    const podcasts = getPodcasts()
    const updatedPodcasts = podcasts.map(p =>
      p.id === podcastId ? {
        ...p,
        headline: editForm.headline,
        content: editForm.content,
        audioUrl: editForm.audioUrl,
        coverImageUrl: editForm.coverImageUrl,
        description: editForm.description,
        transcript: editForm.transcript
      } : p
    )
    savePodcasts(updatedPodcasts)
    setPodcast({
      ...podcast,
      headline: editForm.headline,
      content: editForm.content,
      audioUrl: editForm.audioUrl,
      coverImageUrl: editForm.coverImageUrl,
      description: editForm.description,
      transcript: editForm.transcript
    })
    setIsEditDialogOpen(false)
  }

  const handleDeletePodcast = async () => {
    if (!podcast || !canEditPodcast(podcast, user)) return

    if (confirm('Are you sure you want to delete this podcast? This action cannot be undone.')) {
      try {
        if (isAdmin) {
          const response = await fetch(`/api/content/${podcastId}`, { method: 'DELETE' })
          if (!response.ok) {
            throw new Error('Failed to delete from server')
          }
        }

        const podcasts = getPodcasts()
        const updatedPodcasts = podcasts.filter(p => p.id !== podcastId)
        savePodcasts(updatedPodcasts)
        router.push('/')
      } catch (error) {
        console.error('Delete error:', error)
        alert('Failed to delete podcast. Please try again.')
      }
    }
  }

  const getRelatedPodcasts = () => {
    const podcasts = getPodcasts()
    return podcasts
      .filter(p => p.id !== podcastId && p.category === podcast?.category)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3)
  }

  const sharePodcast = async () => {
    if (navigator.share && podcast) {
      try {
        await navigator.share({
          title: podcast.headline,
          text: podcast.content.substring(0, 200) + '...',
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled or failed:', error)
      }
    } else {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(window.location.href)
          alert('Podcast link copied to clipboard!')
        } else {
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
          alert('Podcast link copied to clipboard!')
        }
      } catch (error) {
        console.error('Failed to copy podcast link:', error)
        alert('Failed to copy link. Please copy the URL manually.')
      }
    }
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const downloadPodcast = () => {
    if (podcast && audioRef.current) {
      const a = document.createElement('a')
      a.href = podcast.audioUrl
      a.download = `${podcast.headline}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  if (!podcast) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading podcast...</p>
        </div>
      </div>
    )
  }

  const isSaved = settings.savedArticles.includes(podcastId)
  const canEdit = podcast ? canEditPodcast(podcast, user) : false
  const relatedPodcasts = getRelatedPodcasts()

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
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

            <div className="flex items-center space-x-4">
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
                onClick={handleSavePodcast}
                className="text-muted-foreground hover:text-primary"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={sharePodcast}
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
                    onClick={handleDeletePodcast}
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
              onClick={() => router.push(`/?category=${podcast.category}`)}
              className="text-muted-foreground hover:text-foreground capitalize"
            >
              {podcast.category}
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground truncate max-w-xs">{podcast.headline}</span>
          </nav>
        </div>
      </div>

      {/* Main Podcast Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">
            <article className="py-8">
              {/* Podcast Header */}
              <header className="mb-6">
                <div className="mb-4">
                  <Badge className="bg-purple-600 text-white text-sm">
                    🎙️ Podcast
                  </Badge>
                  {podcast.episodeNumber && (
                    <Badge variant="secondary" className="ml-2">
                      Episode {podcast.episodeNumber}
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4 text-black">
                  {podcast.headline}
                </h1>

                <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4 mb-2 lg:mb-0">
                    <span className="font-medium">{podcast.author}</span>
                    <span>•</span>
                    <span>{formatFullDate(podcast.publishedAt)}</span>
                    <span>•</span>
                    <span>{formatDuration(podcast.duration)}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span>{podcast.views} plays</span>
                    <button
                      onClick={handleLike}
                      className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{podcast.likes}</span>
                    </button>
                  </div>
                </div>
              </header>

              {/* Cover Image and Audio Player */}
              <div className="mb-8">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-6">
                  <img
                    src={podcast.coverImageUrl}
                    alt={podcast.headline}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <FileAudio className="w-16 h-16 text-white" />
                  </div>
                </div>

                {/* Audio Player */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <audio
                    ref={audioRef}
                    src={podcast.audioUrl}
                    className="w-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    controls={false}
                  />

                  {/* Custom Controls */}
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <Slider
                        value={[currentTime]}
                        onValueChange={handleSeek}
                        max={duration}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSkip(-30)}
                          className="text-gray-600 hover:text-black"
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="default"
                          size="lg"
                          onClick={handlePlayPause}
                          className="min-h-[48px] min-w-[48px]"
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSkip(30)}
                          className="text-gray-600 hover:text-black"
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-gray-600" />
                        <Slider
                          value={[volume]}
                          onValueChange={handleVolumeChange}
                          max={100}
                          step={1}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600">{playbackSpeed}x</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1)}
                          className="text-gray-600 hover:text-black"
                        >
                          Speed
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Podcast Description */}
              <div className="mb-8">
                <h3 className="text-xl font-serif font-bold mb-4">About this episode</h3>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 leading-relaxed">
                    {podcast.description || podcast.content}
                  </p>
                </div>
              </div>

              {/* Transcript Toggle */}
              <div className="mb-8">
                <Button
                  variant="outline"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="w-full"
                >
                  {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                </Button>
              </div>

              {/* Transcript */}
              {showTranscript && (
                <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-serif font-bold mb-4">Transcript</h3>
                  <div className="prose prose-lg max-w-none">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {podcast.transcript || podcast.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Podcast Actions */}
              <footer className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6">
                  <Button
                    variant="outline"
                    onClick={handleLike}
                    className="flex items-center space-x-2"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{podcast.likes} Likes</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={sharePodcast}
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleSavePodcast}
                    className="flex items-center space-x-2"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={downloadPodcast}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </Button>
                </div>
              </footer>
            </article>

            {/* Comments Section */}
            <section className="py-8 border-t border-gray-200">
              <h3 className="text-2xl font-serif font-bold mb-6">Comments ({comments.length})</h3>

              {/* Comment Form */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Input
                      placeholder="Your name (optional)"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="border-gray-300"
                    />
                    <Textarea
                      placeholder="Share your thoughts about this podcast..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="border-gray-300"
                    />
                    <Button
                      onClick={handleComment}
                      disabled={!newComment.trim()}
                      className="bg-black text-white hover:bg-gray-800"
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
                          <AvatarFallback className="bg-gray-200 text-gray-700">
                            {comment.author.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="font-medium text-black">{comment.author}</span>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-800 leading-relaxed">
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
              {/* Podcast Details */}
              <section className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-serif font-bold text-lg mb-3">Podcast Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{formatDuration(podcast.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size</span>
                    <span className="font-medium">{podcast.fileSize || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium">{formatFullDate(podcast.publishedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plays</span>
                    <span className="font-medium">{podcast.views}</span>
                  </div>
                  {podcast.episodeNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Episode</span>
                      <span className="font-medium">#{podcast.episodeNumber}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Related Podcasts */}
              {relatedPodcasts.length > 0 && (
                <section className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-serif font-bold text-lg mb-4">Related Episodes</h3>
                  <div className="space-y-4">
                    {relatedPodcasts.map(relatedPodcast => (
                      <article
                        key={relatedPodcast.id}
                        className="cursor-pointer group"
                        onClick={() => router.push(`/podcast/${relatedPodcast.id}`)}
                      >
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded">
                            <img
                              src={relatedPodcast.coverImageUrl}
                              alt={relatedPodcast.headline}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-serif font-bold text-black group-hover:text-blue-600 transition-colors leading-tight mb-1">
                              {relatedPodcast.headline}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {formatDuration(relatedPodcast.duration)}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Newsletter */}
              <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-serif font-bold text-lg mb-3">Newsletter</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Get the latest podcasts and articles delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="border-gray-300"
                  />
                  <Button className="w-full bg-black text-white hover:bg-gray-800">
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
            <DialogTitle>Edit Podcast</DialogTitle>
            <DialogDescription>
              Make changes to your podcast. You can only edit podcasts within 24 hours of publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={editForm.headline}
                onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                className="border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="content">Description</Label>
              <Textarea
                id="content"
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={6}
                className="border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="coverImageUrl">Cover Image URL</Label>
              <Input
                id="coverImageUrl"
                value={editForm.coverImageUrl}
                onChange={(e) => setEditForm({ ...editForm, coverImageUrl: e.target.value })}
                placeholder="https://example.com/cover.jpg"
                className="border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="transcript">Transcript</Label>
              <Textarea
                id="transcript"
                value={editForm.transcript}
                onChange={(e) => setEditForm({ ...editForm, transcript: e.target.value })}
                rows={8}
                className="border-gray-300"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditPodcast}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}