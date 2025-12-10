import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getToken } from 'next-auth/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Create new content
export async function POST(request: NextRequest) {
    try {
        // Get user from session (optional for migration)
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
        const userId = token?.sub || 'anonymous'

        const body = await request.json()
        const {
            headline,
            content,
            author,
            category,
            mediaType,
            readTime,
            isAI,
            tags,
            image,
            videoUrl,
            thumbnailUrl,
            duration,
            resolution,
            fileSize,
            audioUrl,
            coverImageUrl,
            episodeNumber,
            seasonNumber,
            transcript,
            description
        } = body

        // Validate required fields
        if (!headline || !content || !author || !category || !mediaType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Insert content
        const { data, error } = await supabase
            .from('content')
            .insert({
                user_id: userId,
                headline,
                content,
                author,
                category,
                media_type: mediaType,
                read_time: readTime,
                is_ai: isAI || false,
                tags: tags || [],
                image,
                video_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                duration,
                resolution,
                file_size: fileSize,
                audio_url: audioUrl,
                cover_image_url: coverImageUrl,
                episode_number: episodeNumber,
                season_number: seasonNumber,
                transcript,
                description
            })
            .select()
            .single()

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to create content' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: 'Content published successfully', content: data },
            { status: 201 }
        )
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// GET - Fetch all content
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const mediaType = searchParams.get('mediaType')
        const category = searchParams.get('category')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
            .from('content')
            .select('*')
            .order('published_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (mediaType) {
            query = query.eq('media_type', mediaType)
        }

        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch content' },
                { status: 500 }
            )
        }

        // Transform snake_case to camelCase for frontend
        const transformedData = data?.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            headline: item.headline,
            content: item.content,
            author: item.author,
            category: item.category,
            mediaType: item.media_type,
            publishedAt: item.published_at,
            views: item.views || 0,
            likes: item.likes || 0,
            readTime: item.read_time,
            isAI: item.is_ai || false,
            tags: item.tags || [],
            image: item.image,
            videoUrl: item.video_url,
            thumbnailUrl: item.thumbnail_url,
            duration: item.duration,
            resolution: item.resolution,
            fileSize: item.file_size,
            audioUrl: item.audio_url,
            coverImageUrl: item.cover_image_url,
            episodeNumber: item.episode_number,
            seasonNumber: item.season_number,
            transcript: item.transcript,
            description: item.description
        })) || []

        return NextResponse.json({ content: transformedData }, { status: 200 })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

