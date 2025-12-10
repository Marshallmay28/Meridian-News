import {
  Globe,
  User,
  Zap,
  TrendingUp,
  BookOpen,
  MessageSquare
} from 'lucide-react'

// Enhanced Content Models for Meridian Post
// Supports articles, videos, and podcasts

export type MediaType = 'article' | 'video' | 'podcast'

export interface BaseContent {
  id: string
  userId: string
  headline: string
  content: string
  author: string
  category: string
  publishedAt: string
  views: number
  likes: number
  comments: Comment[]
  readTime: number
  deviceId: string
  isAI?: boolean
  aiSignature?: string
  confidence?: number
  mediaType: MediaType
  tags: string[]
}

export interface Article extends BaseContent {
  mediaType: 'article'
  image?: string
}

export interface Video extends BaseContent {
  mediaType: 'video'
  videoUrl: string
  thumbnailUrl: string
  duration: number // in seconds
  resolution: string
  fileSize?: string
  description?: string
}

export interface Podcast extends BaseContent {
  mediaType: 'podcast'
  audioUrl: string
  coverImageUrl: string
  duration: number // in seconds
  fileSize?: string
  episodeNumber?: number
  seasonNumber?: number
  transcript?: string
  description?: string
}

export type Content = Article | Video | Podcast

export interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
  likes: number
}

export interface Settings {
  fontSize: 'small' | 'medium' | 'large'
  dailyCount: number
  lastPublished: string
  savedArticles: string[]
  readingHistory: string[]
}

export interface MediaUploadConfig {
  maxFileSize: number // in bytes
  allowedVideoTypes: string[]
  allowedAudioTypes: string[]
  allowedImageTypes: string[]
}

export const MEDIA_CONFIG: MediaUploadConfig = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedVideoTypes: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
  allowedAudioTypes: ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
  allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp']
}

export const CATEGORIES = [
  { id: 'world', name: 'World', icon: Globe },
  { id: 'politics', name: 'Politics', icon: User },
  { id: 'technology', name: 'Technology', icon: Zap },
  { id: 'business', name: 'Business', icon: TrendingUp },
  { id: 'sports', name: 'Sports', icon: Zap },
  { id: 'entertainment', name: 'Entertainment', icon: BookOpen },
  { id: 'local', name: 'Local', icon: Globe },
  { id: 'opinion', name: 'Opinion', icon: MessageSquare }
]

// Helper functions
export const isVideo = (content: Content): content is Video => {
  return content.mediaType === 'video'
}

export const isPodcast = (content: Content): content is Podcast => {
  return content.mediaType === 'podcast'
}

export const isArticle = (content: Content): content is Article => {
  return content.mediaType === 'article'
}

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const formatDate = (dateString: string): string => {
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

export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getMediaIcon = (mediaType: MediaType): string => {
  switch (mediaType) {
    case 'video':
      return '🎥'
    case 'podcast':
      return '🎙️'
    case 'article':
    default:
      return '📝'
  }
}

export const getMediaTypeName = (mediaType: MediaType): string => {
  switch (mediaType) {
    case 'video':
      return 'Video'
    case 'podcast':
      return 'Podcast'
    case 'article':
    default:
      return 'Article'
  }
}

// Storage functions
export const getContentStorageKey = (mediaType: MediaType): string => {
  switch (mediaType) {
    case 'video':
      return 'meridianVideos'
    case 'podcast':
      return 'meridianPodcasts'
    case 'article':
    default:
      return 'meridianArticles'
  }
}

export const getAllContent = (): Content[] => {
  if (typeof window === 'undefined') return []

  const articles = JSON.parse(localStorage.getItem('meridianArticles') || '[]')
  const videos = JSON.parse(localStorage.getItem('meridianVideos') || '[]')
  const podcasts = JSON.parse(localStorage.getItem('meridianPodcasts') || '[]')

  return [...articles, ...videos, ...podcasts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export const saveContent = (content: Content): void => {
  if (typeof window === 'undefined') return

  const storageKey = getContentStorageKey(content.mediaType)
  const existingContent = JSON.parse(localStorage.getItem(storageKey) || '[]')

  const updatedContent = existingContent.some((item: Content) => item.id === content.id)
    ? existingContent.map((item: Content) => item.id === content.id ? content : item)
    : [...existingContent, content]

  localStorage.setItem(storageKey, JSON.stringify(updatedContent))
}

export const deleteContent = (contentId: string, mediaType: MediaType): void => {
  if (typeof window === 'undefined') return

  const storageKey = getContentStorageKey(mediaType)
  const existingContent = JSON.parse(localStorage.getItem(storageKey) || '[]')

  const updatedContent = existingContent.filter((item: Content) => item.id !== contentId)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  localStorage.setItem(storageKey, JSON.stringify(updatedContent))
}

export const canEditVideo = (video: Video, user?: { id: string, role?: string } | null): boolean => {
  // Admin bypass
  if (user?.role === 'admin' || (user as any)?.user_metadata?.role === 'admin') return true

  // Owner check
  if (user && user.id === video.userId) return true

  // Legacy deviceId check (fallback for guests or if no user is provided)
  const deviceId = getDeviceId()
  const publishedAt = new Date(video.publishedAt)
  const now = new Date()
  const hoursDiff = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60)

  return !user && video.deviceId === deviceId && hoursDiff <= 24
}

export const canEditPodcast = (podcast: Podcast, user?: { id: string, role?: string } | null): boolean => {
  // Admin bypass
  if (user?.role === 'admin' || (user as any)?.user_metadata?.role === 'admin') return true

  // Owner check
  if (user && user.id === podcast.userId) return true

  // Legacy deviceId check
  const deviceId = getDeviceId()
  const publishedAt = new Date(podcast.publishedAt)
  const now = new Date()
  const hoursDiff = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60)

  return !user && podcast.deviceId === deviceId && hoursDiff <= 24
}

export const canEditArticle = (article: Article, user?: { id: string, role?: string } | null): boolean => {
  // Admin bypass
  if (user?.role === 'admin' || (user as any)?.user_metadata?.role === 'admin') return true

  // Owner check
  if (user && user.id === article.userId) return true

  // Legacy deviceId check
  const deviceId = getDeviceId()
  const publishedAt = new Date(article.publishedAt)
  const now = new Date()
  const hoursDiff = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60)

  return !user && article.deviceId === deviceId && hoursDiff <= 24
}

export const getContentById = (contentId: string): Content | null => {
  const allContent = getAllContent()
  return allContent.find(content => content.id === contentId) || null
}

const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'default-device-id'

  let deviceId = localStorage.getItem('meridianDeviceId')
  if (!deviceId) {
    deviceId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
    localStorage.setItem('meridianDeviceId', deviceId)
  }
  return deviceId
}