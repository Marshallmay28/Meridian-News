'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Sun, Moon, Eye, Save, Upload, Image, Type, Calendar, User, Globe, Zap, BookOpen, TrendingUp, MessageSquare, Brain, Video, Mic, FileText, X, Clock, FileAudio, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { aiGenerator, AIArticle } from '@/lib/ai-generator'
import { Content, MediaType, getAllContent, CATEGORIES, getMediaIcon, getMediaTypeName, saveContent, Settings, MEDIA_CONFIG } from '@/lib/content-models'

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
      return
    }

    // Validate file size
    if (file.size > MEDIA_CONFIG.maxFileSize) {
      setUploadError(`File too large. Maximum size: ${formatFileSize(MEDIA_CONFIG.maxFileSize)}`)
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
  }

  const handlePublish = async () => {
    if (!canPublish()) {
      alert('You have reached your daily limit of 3 content items. Please try again tomorrow.')
      return
    }

    if (!publishForm.headline || !publishForm.content || !publishForm.category) {
      alert('Please fill in all required fields.')
      return
    }

    if ((mediaType === 'video' || mediaType === 'podcast') && !uploadedFile) {
      alert('Please upload a media file.')
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
                    onClick={() => setIsPreview(false)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Edit
                  </Button>
                </div>
                
                <div className="flex items-center space-x-6">
                  <h1 className="text-2xl font-serif font-bold text-black dark:text-white">Preview</h1>
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
                    onClick={handlePublish}
                    disabled={!isValidForm || isPublishing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isPublishing ? 'Publishing...' : 'Publish Now'}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Preview Content */}
          <main className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardContent className="p-8">
                <div className="mb-4">
                  <Badge className="bg-black text-white mb-2">
                    {getMediaIcon(mediaType)} {getMediaTypeName(mediaType)}
                  </Badge>
                  <Badge variant="secondary" className="mb-2">
                    {CATEGORIES.find(c => c.id === publishForm.category)?.name}
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6 text-black dark:text-white">
                  {publishForm.headline || 'Your Headline'}
                </h1>

                <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 mb-6">
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
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                      <audio 
                        src={URL.createObjectURL(uploadedFile)} 
                        controls 
                        className="w-full"
                      />
                      <div className="mt-4 text-center">
                        <FileAudio className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Audio Player</p>
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
                  <div className="font-serif leading-relaxed text-gray-800 dark:text-gray-200">
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
      </div>
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
                <h1 className="text-2xl font-serif font-bold text-black dark:text-white">Publish Content</h1>
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
                  onClick={() => setIsPreview(true)}
                  disabled={!publishForm.headline || !publishForm.content || !publishForm.category}
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Publishing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{remaining}</div>
                  <div className="text-sm text-gray-600">Content Remaining Today</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{count}</div>
                  <div className="text-sm text-gray-600">Published Today</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{wordCount}</div>
                  <div className="text-sm text-gray-600">Words Written</div>
                </div>
              </div>
              
              {!canPublish() && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">
                    You have reached your daily limit of 3 content items. The limit resets at midnight.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media Type Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Content Type</CardTitle>
              <CardDescription>
                Choose the type of content you want to publish. Each type has specific requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['article', 'video', 'podcast'] as MediaType[]).map((type) => (
                  <Button
                    key={type}
                    variant={mediaType === type ? 'default' : 'outline'}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setMediaType(type)}
                  >
                    {getMediaIcon(type)}
                    <span>{getMediaTypeName(type)}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Publishing Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getMediaIcon(mediaType)}
                <span className="ml-2">Create {getMediaTypeName(mediaType)}</span>
              </CardTitle>
              <CardDescription>
                {mediaType === 'article' && 'Share your written story with the community.'}
                {mediaType === 'video' && 'Upload your video content for everyone to watch.'}
                {mediaType === 'podcast' && 'Share your audio content as a podcast episode.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Headline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="headline" className="text-base font-medium">Headline *</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAISuggest}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    AI Suggest
                  </Button>
                </div>
                <Input
                  id="headline"
                  value={publishForm.headline}
                  onChange={(e) => setPublishForm({...publishForm, headline: e.target.value})}
                  placeholder="Enter a compelling headline that grabs attention..."
                  className="w-full"
                />
              </div>

              {/* Author */}
              <div>
                <Label htmlFor="author" className="text-base font-medium">Author Name</Label>
                <Input
                  id="author"
                  value={publishForm.author}
                  onChange={(e) => setPublishForm({...publishForm, author: e.target.value})}
                  placeholder="Your name (optional)"
                  className="w-full"
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-base font-medium">Category *</Label>
                <Select value={publishForm.category} onValueChange={(value) => setPublishForm({...publishForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
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

              {/* Media Upload */}
              {(mediaType === 'video' || mediaType === 'podcast') && (
                <div>
                  <Label className="text-base font-medium">
                    {mediaType === 'video' ? 'Video File' : 'Audio File'} *
                  </Label>
                  <div className="space-y-2">
                    <Input
                      ref={mediaType === 'video' ? videoInputRef : audioInputRef}
                      type="file"
                      accept={mediaType === 'video' ? 
                        MEDIA_CONFIG.allowedVideoTypes.map(ext => `.${ext}`).join(',') :
                        MEDIA_CONFIG.allowedAudioTypes.map(ext => `.${ext}`).join(',')
                      }
                      onChange={(e) => handleFileUpload(e, mediaType)}
                      className="w-full"
                    />
                    {uploadError && (
                      <p className="text-sm text-red-600">{uploadError}</p>
                    )}
                    {uploadedFile && (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                        <div className="flex items-center space-x-2">
                          <Film className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            {uploadedFile.name}
                          </span>
                          <span className="text-xs text-green-600">
                            ({formatFileSize(uploadedFile.size)})
                          </span>
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
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Image URL for articles */}
              {mediaType === 'article' && (
                <div>
                  <Label htmlFor="image" className="text-base font-medium">Image URL</Label>
                  <Input
                    id="image"
                    value={publishForm.description}
                    onChange={(e) => setPublishForm({...publishForm, description: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full"
                  />
                </div>
              )}

              {/* Description for media */}
              {(mediaType === 'video' || mediaType === 'podcast') && (
                <div>
                  <Label htmlFor="description" className="text-base font-medium">
                    {mediaType === 'video' ? 'Thumbnail URL' : 'Cover Image URL'}
                  </Label>
                  <Input
                    id="description"
                    value={publishForm.description}
                    onChange={(e) => setPublishForm({...publishForm, description: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full"
                  />
                </div>
              )}

              {/* Duration for media */}
              {(mediaType === 'video' || mediaType === 'podcast') && (
                <div>
                  <Label htmlFor="duration" className="text-base font-medium">
                    Duration (seconds)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={publishForm.duration}
                    onChange={(e) => setPublishForm({...publishForm, duration: parseInt(e.target.value) || 0})}
                    placeholder="300"
                    className="w-full"
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <Label htmlFor="content" className="text-base font-medium">
                  {mediaType === 'podcast' ? 'Transcript' : 'Content'} *
                </Label>
                <Textarea
                  id="content"
                  value={publishForm.content}
                  onChange={(e) => setPublishForm({...publishForm, content: e.target.value})}
                  placeholder={
                    mediaType === 'article' ? 'Write your article content here...' :
                    mediaType === 'video' ? 'Describe your video content...' :
                    'Write your podcast transcript or description...'
                  }
                  rows={8}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>{wordCount} words</span>
                  <span>~{estimatedReadTime} min read</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handlePublish}
                  disabled={!isValidForm || isPublishing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}