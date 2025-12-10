'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Search, Menu, Plus, Sun, Moon, Heart, MessageSquare, Share2, Clock, Calendar, User, ArrowLeft, Bookmark, TrendingUp, Send, X, Edit, Trash2, Brain, Play, Pause, Volume2, Maximize2 } from 'lucide-react'
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
import { Video as VideoType, Comment, Settings, formatDuration, formatDate, formatFullDate, canEditVideo } from '@/lib/content-models'

const getDeviceId = () => {
  let deviceId = localStorage.getItem('meridianDeviceId')
  if (!deviceId) {
    deviceId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
    localStorage.setItem('meridianDeviceId', deviceId)
  }
  return deviceId
}

const getVideos = (): VideoType[] => {
  if (typeof window === 'undefined') return []

  const videos = localStorage.getItem('meridianVideos')
  return videos ? JSON.parse(videos) : []
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

const saveVideos = (videos: VideoType[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('meridianVideos', JSON.stringify(videos))
  }
}

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params.id as string
  const { isAdmin, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [video, setVideo] = useState<VideoType | null>(null)
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
    videoUrl: '',
    thumbnailUrl: '',
    description: ''
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(75)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)

    const fetchVideo = async () => {
      try {
        // Try database first
        const response = await fetch(`/api/content/${videoId}`)
        if (response.ok) {
          const data = await response.json()
          const foundVideo = data.content

          if (foundVideo) {
            setVideo(foundVideo)
            setComments(foundVideo.comments || [])
            setEditForm({
              headline: foundVideo.headline,
              content: foundVideo.content,
              videoUrl: foundVideo.videoUrl || '',
              thumbnailUrl: foundVideo.thumbnailUrl || '',
              description: foundVideo.description || ''
            })

            // Update view count locally (API already did it)
            setVideo(prev => prev ? { ...prev, views: (foundVideo.views || 0) } : foundVideo)

            // Add to reading history
            const updatedSettings = {
              ...loadedSettings,
              readingHistory: [videoId, ...loadedSettings.readingHistory.filter(id => id !== videoId)].slice(0, 50)
            }
            setSettings(updatedSettings)
            saveSettings(updatedSettings)
            return // Success, exit early
          }
        }
      } catch (error) {
        console.error('Error fetching video from API:', error)
      }

      // Fallback to localStorage
      const videos = getVideos()
      const foundVideo = videos.find(v => v.id === videoId)

      if (foundVideo) {
        setVideo(foundVideo)
        setComments(foundVideo.comments)
        setEditForm({
          headline: foundVideo.headline,
          content: foundVideo.content,
          videoUrl: foundVideo.videoUrl,
          thumbnailUrl: foundVideo.thumbnailUrl,
          description: foundVideo.description || ''
        })

        // Update view count
        const updatedVideos = videos.map(v =>
          v.id === videoId ? { ...v, views: v.views + 1 } : v
        )
        saveVideos(updatedVideos)
        setVideo({ ...foundVideo, views: foundVideo.views + 1 })

        // Add to reading history
        const updatedSettings = {
          ...loadedSettings,
          readingHistory: [videoId, ...loadedSettings.readingHistory.filter(id => id !== videoId)].slice(0, 50)
        }
        setSettings(updatedSettings)
        saveSettings(updatedSettings)
      } else {
        console.error('Video not found in database or localStorage')
        // Only redirect if absolutely sure (optional, or maybe show a "Not Found" UI)
        // router.push('/') 
      }
    }

    fetchVideo()
  }, [videoId])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const handleLike = () => {
    if (!video) return

    const videos = getVideos()
    const updatedVideos = videos.map(v =>
      v.id === videoId ? { ...v, likes: v.likes + 1 } : v
    )
    saveVideos(updatedVideos)
    setVideo({ ...video, likes: video.likes + 1 })
  }

  const handleSaveVideo = () => {
    if (!video) return

    const updatedSettings = {
      ...settings,
      savedArticles: settings.savedArticles.includes(videoId)
        ? settings.savedArticles.filter(id => id !== videoId)
        : [...settings.savedArticles, videoId]
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  const handleComment = () => {
    if (!video || !newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      author: commentAuthor || 'Anonymous Viewer',
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0
    }

    const updatedComments = [...comments, comment]
    setComments(updatedComments)

    const videos = getVideos()
    const updatedVideos = videos.map(v =>
      v.id === videoId ? { ...v, comments: updatedComments } : v
    )
    saveVideos(updatedVideos)

    setNewComment('')
    setCommentAuthor('')
  }

  const handleEditVideo = () => {
    if (!video || !canEditVideo(video)) return

    const videos = getVideos()
    const updatedVideos = videos.map(v =>
      v.id === videoId ? {
        ...v,
        headline: editForm.headline,
        content: editForm.content,
        videoUrl: editForm.videoUrl,
        thumbnailUrl: editForm.thumbnailUrl,
        description: editForm.description
      } : v
    )
    saveVideos(updatedVideos)
    setVideo({
      ...video,
      headline: editForm.headline,
      content: editForm.content,
      videoUrl: editForm.videoUrl,
      thumbnailUrl: editForm.thumbnailUrl,
      description: editForm.description
    })
    setIsEditDialogOpen(false)
  }

  const handleDeleteVideo = async () => {
    if (!video || !canEditVideo(video, user)) return

    if (confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      try {
        if (isAdmin) {
          const response = await fetch(`/api/content/${videoId}`, { method: 'DELETE' })
          if (!response.ok) {
            throw new Error('Failed to delete from server')
          }
        }

        const videos = getVideos()
        const updatedVideos = videos.filter(v => v.id !== videoId)
        saveVideos(updatedVideos)
        router.push('/')
      } catch (error) {
        console.error('Delete error:', error)
        alert('Failed to delete video. Please try again.')
      }
    }
  }

  const getRelatedVideos = () => {
    const videos = getVideos()
    return videos
      .filter(v => v.id !== videoId && v.category === video?.category)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3)
  }

  const shareVideo = async () => {
    if (navigator.share && video) {
      try {
        await navigator.share({
          title: video.headline,
          text: video.content.substring(0, 200) + '...',
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled or failed:', error)
      }
    } else {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(window.location.href)
          alert('Video link copied to clipboard!')
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
          alert('Video link copied to clipboard!')
        }
      } catch (error) {
        console.error('Failed to copy video link:', error)
        alert('Failed to copy link. Please copy the URL manually.')
      }
    }
  }

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        try {
          await videoRef.current.play()
        } catch (error) {
          // Playback request was interrupted or failed (e.g. user paused immediately or navigated away)
          // We can safely ignore AbortError as it's a standard behavior in these cases
          if ((error as DOMException).name !== 'AbortError') {
            console.error("Playback error:", error)
          }
        }
      }
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    )
  }

  const isSaved = settings.savedArticles.includes(videoId)
  const canEdit = video ? canEditVideo(video, user) : false
  const relatedVideos = getRelatedVideos()

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
                onClick={handleSaveVideo}
                className="text-muted-foreground hover:text-primary"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={shareVideo}
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
                    onClick={handleDeleteVideo}
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
              onClick={() => router.push(`/?category=${video.category}`)}
              className="text-muted-foreground hover:text-foreground capitalize"
            >
              {video.category}
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground truncate max-w-xs">{video.headline}</span>
          </nav>
        </div>
      </div>

      {/* Main Video Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">
            <article className="py-8">
              {/* Video Header */}
              <header className="mb-6">
                <div className="mb-4">
                  <Badge className="bg-red-600 text-white text-sm">
                    🎥 Video
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4 text-foreground">
                  {video.headline}
                </h1>

                <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4 mb-2 lg:mb-0">
                    <span className="font-medium">{video.author}</span>
                    <span>•</span>
                    <span>{formatFullDate(video.publishedAt)}</span>
                    <span>•</span>
                    <span>{formatDuration(video.duration)}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span>{video.views} views</span>
                    <button
                      onClick={handleLike}
                      className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{video.likes}</span>
                    </button>
                  </div>
                </div>
              </header>

              {/* Video Player */}
              <div className="mb-8">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={video.videoUrl || undefined}
                    className="w-full aspect-video"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    controls={false}
                  />

                  {/* Custom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <Slider
                        value={[currentTime]}
                        onValueChange={handleSeek}
                        max={duration}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-white mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handlePlayPause}
                          className="text-white hover:text-gray-300"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>

                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-4 h-4 text-white" />
                          <Slider
                            value={[volume]}
                            onValueChange={handleVolumeChange}
                            max={100}
                            step={1}
                            className="w-24"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-white text-sm">{playbackSpeed}x</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1)}
                          className="text-white hover:text-gray-300"
                        >
                          Speed
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:text-gray-300"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Description */}
              <div className="mb-8">
                <h3 className="text-xl font-serif font-bold mb-4">About this video</h3>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 leading-relaxed">
                    {video.description || video.content}
                  </p>
                </div>
              </div>

              {/* Video Actions */}
              <footer className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6">
                  <Button
                    variant="outline"
                    onClick={handleLike}
                    className="flex items-center space-x-2"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{video.likes} Likes</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={shareVideo}
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleSaveVideo}
                    className="flex items-center space-x-2"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
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
                      placeholder="Share your thoughts about this video..."
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
              {/* Video Details */}
              <section className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-serif font-bold text-lg mb-3">Video Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{formatDuration(video.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolution</span>
                    <span className="font-medium">{video.resolution || 'HD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size</span>
                    <span className="font-medium">{video.fileSize || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium">{formatFullDate(video.publishedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">{video.views}</span>
                  </div>
                </div>
              </section>

              {/* Related Videos */}
              {relatedVideos.length > 0 && (
                <section className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-serif font-bold text-lg mb-4">Related Videos</h3>
                  <div className="space-y-4">
                    {relatedVideos.map(relatedVideo => (
                      <article
                        key={relatedVideo.id}
                        className="cursor-pointer group"
                        onClick={() => router.push(`/video/${relatedVideo.id}`)}
                      >
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0 w-24 h-16 overflow-hidden rounded">
                            <img
                              src={relatedVideo.thumbnailUrl}
                              alt={relatedVideo.headline}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-serif font-bold text-black group-hover:text-blue-600 transition-colors leading-tight mb-1">
                              {relatedVideo.headline}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {formatDuration(relatedVideo.duration)}
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
                  Get the latest videos and articles delivered to your inbox.
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
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Make changes to your video. You can only edit videos within 24 hours of publishing.
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
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={editForm.thumbnailUrl}
                onChange={(e) => setEditForm({ ...editForm, thumbnailUrl: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
                className="border-gray-300"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditVideo}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}