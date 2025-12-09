import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://meridian-post.com'

    // Static pages
    const routes = [
        '',
        '/publish',
        '/ai-lab',
        '/auth/login',
        '/auth/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // TODO: Add dynamic content URLs from database
    // Example: Fetch recent articles, videos, podcasts
    /*
    const { data: articles } = await supabase
      .from('articles')
      .select('id, updated_at')
      .limit(1000)
    
    const articleUrls = articles?.map((article) => ({
      url: `${baseUrl}/article/${article.id}`,
      lastModified: article.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) || []
    */

    return routes
}
