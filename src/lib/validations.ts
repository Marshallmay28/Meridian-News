import { z } from 'zod'

// User schemas
export const userSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
})

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

// Article schemas
export const articleSchema = z.object({
    headline: z.string().min(10, 'Headline must be at least 10 characters').max(500),
    content: z.string().min(100, 'Content must be at least 100 characters'),
    image: z.string().url('Invalid image URL').optional().or(z.literal('')),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).default([]),
    isAI: z.boolean().default(false),
    aiSignature: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
})

export const updateArticleSchema = articleSchema.partial()

// Video schemas
export const videoSchema = z.object({
    headline: z.string().min(10, 'Headline must be at least 10 characters').max(500),
    content: z.string().min(50, 'Content must be at least 50 characters'),
    description: z.string().optional(),
    videoUrl: z.string().url('Invalid video URL'),
    thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).default([]),
    duration: z.number().positive('Duration must be positive'),
    resolution: z.string().optional(),
    fileSize: z.string().optional(),
    isAI: z.boolean().default(false),
})

export const updateVideoSchema = videoSchema.partial()

// Podcast schemas
export const podcastSchema = z.object({
    headline: z.string().min(10, 'Headline must be at least 10 characters').max(500),
    content: z.string().min(50, 'Content must be at least 50 characters'),
    description: z.string().optional(),
    audioUrl: z.string().url('Invalid audio URL'),
    coverImageUrl: z.string().url('Invalid cover image URL').optional(),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).default([]),
    duration: z.number().positive('Duration must be positive'),
    episodeNumber: z.number().positive().optional(),
    transcript: z.string().optional(),
    fileSize: z.string().optional(),
    isAI: z.boolean().default(false),
})

export const updatePodcastSchema = podcastSchema.partial()

// Comment schemas
export const commentSchema = z.object({
    contentType: z.enum(['article', 'video', 'podcast']),
    contentId: z.string().uuid('Invalid content ID'),
    authorName: z.string().min(1, 'Author name is required').max(255),
    content: z.string().min(1, 'Comment cannot be empty').max(1000),
})

// Platform settings schema
export const platformSettingsSchema = z.object({
    aiEnabled: z.boolean(),
    allowVideos: z.boolean(),
    allowPodcasts: z.boolean(),
    moderationEnabled: z.boolean(),
    dailyLimit: z.number().min(1).max(100),
})

// Query parameter schemas
export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
})

export const contentFilterSchema = z.object({
    category: z.string().optional(),
    isAI: z.coerce.boolean().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['latest', 'popular', 'trending']).default('latest'),
})

// Type exports
export type UserInput = z.infer<typeof userSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ArticleInput = z.infer<typeof articleSchema>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>
export type VideoInput = z.infer<typeof videoSchema>
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>
export type PodcastInput = z.infer<typeof podcastSchema>
export type UpdatePodcastInput = z.infer<typeof updatePodcastSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type PlatformSettingsInput = z.infer<typeof platformSettingsSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type ContentFilterInput = z.infer<typeof contentFilterSchema>

// Sanitization helper
export function sanitizeHtml(html: string): string {
    // Basic XSS prevention - remove script tags and dangerous attributes
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/javascript:/gi, '')
}

// Validation helper for API routes
export function validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string } {
    try {
        const validated = schema.parse(data)
        return { success: true, data: validated }
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.errors[0]
            return {
                success: false,
                error: firstError.message
            }
        }
        return {
            success: false,
            error: 'Validation failed'
        }
    }
}
