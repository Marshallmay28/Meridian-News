'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Sun, Moon, Eye, X, Film, Brain, Video, Mic, FileText, Image, Type, Calendar, User, Globe, Zap, BookOpen, Clock, FileAudio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { aiGenerator, AIArticle } from '@/lib/ai-generator'
import { Content, MediaType, getAllContent, CATEGORIES, getMediaIcon, getMediaTypeName, saveContent, Settings, MEDIA_CONFIG } from '@/lib/content-models'
import { toast } from 'sonner'

const getDeviceId = () => {
  let deviceId = localStorage.getItem('meridianDeviceId')
  if (!deviceId) {
    deviceId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
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

const canPublish = (): boolean => {
  const today = new Date().toDateString()
  const settings = getSettings()

  if (settings.lastPublished !== today) {
    return true
  }

  return settings.dailyCount < 3
}

const getPublishingCount = (): { count: number; remaining: number } => {
  const today = new Date().toDateString()
  const settings = getSettings()

  if (settings.lastPublished !== today) {
    return { count: 0, remaining: 3 }
  }

  return {
    count: settings.dailyCount,
    remaining: 3 - settings.dailyCount
  }
}

const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function PublishPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    fontSize: 'medium',
    dailyCount: 0,
    lastPublished: '',
    savedArticles: [],
    readingHistory: []
  })
  const [isPreview, setIsPreview] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [mediaType, setMediaType] = useState<MediaType>('article')
  const [publishForm, setPublishForm] = useState({
    headline: '',
    content: '',
    author: '',
    category: '',
    description: '',
    duration: 0,
    fileSize: 0,
    fileName: ''
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
  }, [])

  useEffect(() => {
    saveSettings(settings)
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const { count, remaining } = getPublishingCount()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: MediaType) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = type === 'video' ? MEDIA_CONFIG.allowedVideoTypes :
      type === 'podcast' ? MEDIA_CONFIG.allowedAudioTypes :
        MEDIA_CONFIG.allowedImageTypes

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setUploadError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
      toast.error(`Invalid file type`)
      return
    }

    // Validate file size
    if (file.size > MEDIA_CONFIG.maxFileSize) {
      setUploadError(`File too large. Maximum size: ${formatFileSize(MEDIA_CONFIG.maxFileSize)}`)
      toast.error('File too large')
      return
    }

    setUploadedFile(file)
    setPublishForm({
      ...publishForm,
      fileSize: file.size,
      fileName: file.name
    })
    setUploadError('')

    // Simulate upload progress
    setUploadProgress(0)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 100)
    toast.success('File uploaded successfully')
  }

  const handlePublish = async () => {
    if (!canPublish()) {
      toast.error('Daily limit reached. Try again tomorrow.')
      return
    }

    if (!publishForm.headline || !publishForm.content || !publishForm.category) {
      toast.error('Please fill in all required fields.')
      return
    }

    if ((mediaType === 'video' || mediaType === 'podcast') && !uploadedFile) {
      toast.error('Please upload a media file.')
      return
    }

    setIsPublishing(true)

    // Simulate publishing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const newContent: Content = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      headline: publishForm.headline,
      content: publishForm.content,
      author: publishForm.author || 'Anonymous Contributor',
      category: publishForm.category,
      publishedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: [],
      readTime: calculateReadTime(publishForm.content),
      deviceId: getDeviceId(),
      mediaType,
      tags: [],
      ...(mediaType === 'article' && {
        image: publishForm.description // Using description field for image URL in articles
      }),
      ...(mediaType === 'video' && uploadedFile && {
        videoUrl: URL.createObjectURL(uploadedFile),
        thumbnailUrl: publishForm.description || `https://images.unsplash.com/photo-1579546923517-1c35bab8b3a4?w=800`,
        duration: publishForm.duration || 300,
        resolution: '1920x1080',
        fileSize: formatFileSize(uploadedFile.size),
        description: publishForm.description
      }),
      ...(mediaType === 'podcast' && uploadedFile && {
        audioUrl: URL.createObjectURL(uploadedFile),
        coverImageUrl: publishForm.description || `https://images.unsplash.com/photo-1478737184215-538159621ad6?w=800`,
        duration: publishForm.duration || 1800,
        fileSize: formatFileSize(uploadedFile.size),
        description: publishForm.description,
        transcript: publishForm.content
      })
    } as Content

    saveContent(newContent)

    // Update publishing count
    const today = new Date().toDateString()
    const currentCount = settings.lastPublished === today ? settings.dailyCount + 1 : 1
    const updatedSettings = {
      ...settings,
      dailyCount: currentCount,
      lastPublished: today
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)

    setIsPublishing(false)
    toast.success(`🎉 You have published your ${getMediaTypeName(mediaType).toLowerCase()}!`)


    // Redirect to the new content
    if (mediaType === 'video') {
      router.push(`/video/${newContent.id}`)
    } else if (mediaType === 'podcast') {
      router.push(`/podcast/${newContent.id}`)
    } else {
      router.push(`/article/${newContent.id}`)
    }
  }

  const handleAISuggest = () => {
    const aiArticle = aiGenerator.generateArticle(publishForm.category || 'random')
    setPublishForm({
      ...publishForm,
      headline: aiArticle.headline,
      content: aiArticle.content
    })
    toast.success('AI suggestions applied')
  }

  const wordCount = publishForm.content.split(/\s+/).filter(word => word.length > 0).length
  const estimatedReadTime = calculateReadTime(publishForm.content)
  const isValidForm = publishForm.headline && publishForm.content && publishForm.category && canPublish()

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />
      case 'podcast':
        return <Mic className="w-5 h-5" />
      case 'article':
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getMediaTypeName = (type: MediaType) => {
    switch (type) {
      case 'video':
        return 'Video'
      case 'podcast':
        return 'Podcast'
      case 'article':
      default:
        return 'Article'
    }
  }

  if (isPreview) {
    return (
      <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark' : ''} bg-background`}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-white/20 dark:border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreview(false)}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Edit
                </Button>
              </div>

              <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-serif font-bold">Preview</h1>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })}
                >
                  {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>

                <Button
                  onClick={handlePublish}
                  disabled={!isValidForm || isPublishing}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Now'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Preview Content */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-none shadow-xl">
            <CardContent className="p-8">
              <div className="mb-4">
                <Badge className="bg-black text-white mb-2">
                  {getMediaIcon(mediaType)} {getMediaTypeName(mediaType)}
                </Badge>
                <Badge variant="secondary" className="mb-2 ml-2">
                  {CATEGORIES.find(c => c.id === publishForm.category)?.name}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6 text-foreground">
                {publishForm.headline || 'Your Headline'}
              </h1>

              <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground mb-6">
                <div className="flex items-center space-x-4 mb-2 md:mb-0">
                  <span className="font-medium">{publishForm.author || 'Anonymous Contributor'}</span>
                  <span>•</span>
                  <span>Just now</span>
                  <span>•</span>
                  <span>{estimatedReadTime} min read</span>
                </div>
              </div>

              {/* Media Preview */}
              {mediaType === 'video' && uploadedFile && (
                <div className="mb-8">
                  <video
                    src={URL.createObjectURL(uploadedFile)}
                    controls
                    className="w-full max-h-96 rounded-lg shadow-lg"
                  />
                </div>
              )}

              {mediaType === 'podcast' && uploadedFile && (
                <div className="mb-8">
                  <div className="bg-secondary/50 p-6 rounded-lg border border-border/50">
                    <audio
                      src={URL.createObjectURL(uploadedFile)}
                      controls
                      className="w-full"
                    />
                    <div className="mt-4 text-center">
                      <FileAudio className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Audio Player</p>
                    </div>
                  </div>
                </div>
              )}

              {mediaType === 'article' && publishForm.description && (
                <div className="mb-8">
                  <img
                    src={publishForm.description}
                    alt={publishForm.headline}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}

              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="font-serif leading-relaxed text-foreground/90">
                  {publishForm.content.split('\n').map((paragraph, index) => (
                    <p key={index} className={index === 0 ? 'text-2xl md:text-3xl font-bold leading-tight mb-6 first-letter:text-6xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:leading-none' : 'mb-4'}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark' : ''} bg-background`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-white/20 dark:border-white/10 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase hidden md:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-serif font-bold">Publish Content</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })}
              >
                {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsPreview(true)}
                disabled={!publishForm.headline || !publishForm.content || !publishForm.category}
                className="rounded-full hidden sm:flex"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Publishing Status */}
        <Card className="mb-8 border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Publishing Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-xl backdrop-blur-sm border border-white/20 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{remaining}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Remaining</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-xl backdrop-blur-sm border border-white/20 shadow-sm">
                <div className="text-3xl font-bold text-green-600">{count}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Published</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-xl backdrop-blur-sm border border-white/20 shadow-sm">
                <div className="text-3xl font-bold text-purple-600">{wordCount}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Words</div>
              </div>
            </div>

            {!canPublish() && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
                <p className="text-red-700 dark:text-red-300 font-medium">
                  Daily limit reached. Come back tomorrow!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Media Type Selection */}
        <Card className="mb-8 border-none shadow-md">
          <CardHeader>
            <CardTitle>Select Format</CardTitle>
            <CardDescription>
              Choose how you want to tell your story.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['article', 'video', 'podcast'] as MediaType[]).map((type) => (
                <Button
                  key={type}
                  variant={mediaType === type ? 'default' : 'outline'}
                  className={`h-24 flex flex-col items-center justify-center space-y-2 rounded-xl border-2 ${mediaType === type ? 'border-primary' : 'border-transparent bg-secondary/50 hover:bg-secondary'}`}
                  onClick={() => setMediaType(type)}
                >
                  {getMediaIcon(type)}
                  <span className="font-medium">{getMediaTypeName(type)}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Publishing Form */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-serif">
              Create Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Headline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="headline" className="text-base font-semibold">Headline</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAISuggest}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Suggest
                </Button>
              </div>
              <Input
                id="headline"
                value={publishForm.headline}
                onChange={(e) => setPublishForm({ ...publishForm, headline: e.target.value })}
                placeholder="Enter a compelling headline..."
                className="text-xl font-serif p-6 h-auto"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author" className="font-semibold">Author</Label>
                <Input
                  id="author"
                  value={publishForm.author}
                  onChange={(e) => setPublishForm({ ...publishForm, author: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="font-semibold">Category</Label>
                <Select value={publishForm.category} onValueChange={(value) => setPublishForm({ ...publishForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Media Upload */}
            {(mediaType === 'video' || mediaType === 'podcast') && (
              <div className="p-6 bg-secondary/30 rounded-xl border border-dashed border-border">
                <Label className="text-base font-semibold mb-4 block">
                  {mediaType === 'video' ? 'Upload Video' : 'Upload Audio'}
                </Label>
                <div className="space-y-4">
                  <Input
                    ref={mediaType === 'video' ? videoInputRef : audioInputRef}
                    type="file"
                    accept={mediaType === 'video' ?
                      MEDIA_CONFIG.allowedVideoTypes.map(ext => `.${ext}`).join(',') :
                      MEDIA_CONFIG.allowedAudioTypes.map(ext => `.${ext}`).join(',')
                    }
                    onChange={(e) => handleFileUpload(e, mediaType)}
                    className="w-full cursor-pointer"
                  />
                  {uploadError && (
                    <p className="text-sm text-red-600 font-medium">{uploadError}</p>
                  )}
                  {uploadedFile && (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                          <Film className="w-4 h-4 text-green-700 dark:text-green-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {formatFileSize(uploadedFile.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null)
                          setUploadError('')
                          setUploadProgress(0)
                          if (mediaType === 'video' && videoInputRef.current) {
                            videoInputRef.current.value = ''
                          }
                          if (mediaType === 'podcast' && audioInputRef.current) {
                            audioInputRef.current.value = ''
                          }
                        }}
                        className="text-green-700 hover:text-green-800 hover:bg-green-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* URL Inputs */}
            {mediaType === 'article' && (
              <div className="space-y-2">
                <Label htmlFor="image" className="font-semibold">Cover Image URL</Label>
                <Input
                  id="image"
                  value={publishForm.description}
                  onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}

            {(mediaType === 'video' || mediaType === 'podcast') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-semibold">
                    {mediaType === 'video' ? 'Thumbnail URL' : 'Cover Image URL'}
                  </Label>
                  <Input
                    id="description"
                    value={publishForm.description}
                    onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="font-semibold">Duration (sec)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={publishForm.duration}
                    onChange={(e) => setPublishForm({ ...publishForm, duration: parseInt(e.target.value) || 0 })}
                    placeholder="300"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="font-semibold">
                {mediaType === 'podcast' ? 'Transcript / Notes' : 'Content'}
              </Label>
              <Textarea
                id="content"
                value={publishForm.content}
                onChange={(e) => setPublishForm({ ...publishForm, content: e.target.value })}
                placeholder="Tell your story..."
                rows={12}
                className="font-serif text-lg leading-relaxed resize-y min-h-[300px]"
              />
              <div className="flex justify-end text-xs text-muted-foreground">
                {wordCount} words • ~{estimatedReadTime} min read
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handlePublish}
                disabled={!isValidForm || isPublishing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                {isPublishing ? 'Publishing...' : 'Publish Content'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}