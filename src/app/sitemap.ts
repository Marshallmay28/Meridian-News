import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://meridian-post.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ai-lab`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/publish`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]

  // Fetch dynamic content from database
  try {
    const { data: content, error } = await supabase
      .from('content')
      .select('id, media_type, published_at')
      .order('published_at', { ascending: false })
      .limit(1000) // Limit to most recent 1000 items

    if (error) {
      console.error('Error fetching content for sitemap:', error)
      return staticPages
    }

    // Generate URLs for all content
    const contentPages: MetadataRoute.Sitemap = (content || []).map((item) => {
      const urlPath = item.media_type === 'video'
        ? `/video/${item.id}`
        : item.media_type === 'podcast'
          ? `/podcast/${item.id}`
          : `/article/${item.id}`

      return {
        url: `${baseUrl}${urlPath}`,
        lastModified: new Date(item.published_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }
    })

    return [...staticPages, ...contentPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
