import { Metadata } from 'next'

interface GenerateMetadataProps {
    title: string
    description: string
    keywords?: string[]
    image?: string
    url?: string
    type?: 'website' | 'article' | 'video' | 'podcast'
    publishedTime?: string
    author?: string
}

export function generateSEOMetadata({
    title,
    description,
    keywords = [],
    image = '/og-image.png',
    url = '',
    type = 'website',
    publishedTime,
    author,
}: GenerateMetadataProps): Metadata {
    const baseUrl = 'https://meridian-post.com'
    const fullUrl = `${baseUrl}${url}`
    const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`

    return {
        title,
        description,
        keywords: keywords.join(', '),
        authors: author ? [{ name: author }] : undefined,
        creator: 'Meridian Post',
        publisher: 'Meridian Post',

        // Open Graph
        openGraph: {
            title,
            description,
            url: fullUrl,
            siteName: 'Meridian Post',
            images: [
                {
                    url: fullImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'en_US',
            type,
            publishedTime,
        },

        // Twitter
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [fullImage],
            creator: '@meridianpost',
        },

        // Additional
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        // Verification (add your codes)
        // verification: {
        //   google: 'your-google-verification-code',
        //   yandex: 'your-yandex-verification-code',
        // },
    }
}

// Article-specific metadata
export function generateArticleMetadata(article: {
    headline: string
    content: string
    image?: string
    author: string
    category: string
    publishedAt: string
    tags?: string[]
}): Metadata {
    const excerpt = article.content.substring(0, 160) + '...'

    return generateSEOMetadata({
        title: `${article.headline} | Meridian Post`,
        description: excerpt,
        keywords: [article.category, ...(article.tags || [])],
        image: article.image,
        url: `/article/${article.headline.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'article',
        publishedTime: article.publishedAt,
        author: article.author,
    })
}

// Video-specific metadata
export function generateVideoMetadata(video: {
    headline: string
    content: string
    thumbnailUrl?: string
    author: string
    category: string
    publishedAt: string
    duration: number
}): Metadata {
    return generateSEOMetadata({
        title: `${video.headline} | Meridian Post`,
        description: video.content.substring(0, 160) + '...',
        keywords: [video.category, 'video'],
        image: video.thumbnailUrl,
        url: `/video/${video.headline.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'video',
        publishedTime: video.publishedAt,
        author: video.author,
    })
}

// Podcast-specific metadata
export function generatePodcastMetadata(podcast: {
    headline: string
    content: string
    coverImageUrl?: string
    author: string
    category: string
    publishedAt: string
    duration: number
}): Metadata {
    return generateSEOMetadata({
        title: `${podcast.headline} | Meridian Post`,
        description: podcast.content.substring(0, 160) + '...',
        keywords: [podcast.category, 'podcast'],
        image: podcast.coverImageUrl,
        url: `/podcast/${podcast.headline.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'article', // Podcasts use article type
        publishedTime: podcast.publishedAt,
        author: podcast.author,
    })
}
