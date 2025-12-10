/**
 * Content Transformer Utility
 * Transforms database snake_case fields to frontend camelCase
 */

export interface DbContent {
    id: string
    user_id: string
    headline: string
    content: string
    author: string
    category: string
    media_type: 'article' | 'video' | 'podcast'
    published_at: string
    views?: number
    likes?: number
    read_time?: number
    is_ai?: boolean
    tags?: string[]
    image?: string
    video_url?: string
    thumbnail_url?: string
    duration?: number
    resolution?: string
    file_size?: number
    audio_url?: string
    cover_image_url?: string
    episode_number?: number
    season_number?: number
    transcript?: string
    description?: string
}

export interface TransformedContent {
    id: string
    userId: string
    headline: string
    content: string
    author: string
    category: string
    mediaType: 'article' | 'video' | 'podcast'
    publishedAt: string
    views: number
    likes: number
    readTime?: number
    isAI: boolean
    tags: string[]
    image?: string
    videoUrl?: string
    thumbnailUrl?: string
    duration?: number
    resolution?: string
    fileSize?: number
    audioUrl?: string
    coverImageUrl?: string
    episodeNumber?: number
    seasonNumber?: number
    transcript?: string
    description?: string
}

/**
 * Transform a single content item from database format to frontend format
 */
export function transformContent(dbContent: DbContent): TransformedContent {
    return {
        id: dbContent.id,
        userId: dbContent.user_id,
        headline: dbContent.headline,
        content: dbContent.content,
        author: dbContent.author,
        category: dbContent.category,
        mediaType: dbContent.media_type,
        publishedAt: dbContent.published_at,
        views: dbContent.views || 0,
        likes: dbContent.likes || 0,
        readTime: dbContent.read_time,
        isAI: dbContent.is_ai || false,
        tags: dbContent.tags || [],
        image: dbContent.image,
        videoUrl: dbContent.video_url,
        thumbnailUrl: dbContent.thumbnail_url,
        duration: dbContent.duration,
        resolution: dbContent.resolution,
        fileSize: dbContent.file_size,
        audioUrl: dbContent.audio_url,
        coverImageUrl: dbContent.cover_image_url,
        episodeNumber: dbContent.episode_number,
        seasonNumber: dbContent.season_number,
        transcript: dbContent.transcript,
        description: dbContent.description
    }
}

/**
 * Transform an array of content items
 */
export function transformContentArray(dbContentArray: DbContent[]): TransformedContent[] {
    return dbContentArray.map(transformContent)
}
