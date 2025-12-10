import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { transformContentArray, type DbContent } from '@/lib/content-transformer'
import { requireAuth } from '@/lib/auth-middleware'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST - Create new content
export async function POST(request: NextRequest) {
    try {
        // Require authentication for content creation
        const authResult = await requireAuth(request)

        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error || 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = authResult.user?.id || 'anonymous'
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
            logger.error('Database error creating content', error as Error)
            return NextResponse.json(
                { error: 'Failed to create content' },
                { status: 500 }
            )
        }

        logger.info('Content created successfully', { contentId: data.id, userId })

        return NextResponse.json(
            { message: 'Content published successfully', content: data },
            { status: 201 }
        )
    } catch (error) {
        logger.error('Server error in POST /api/content', error as Error)
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
            logger.error('Database error fetching content', error as Error)
            return NextResponse.json(
                { error: 'Failed to fetch content' },
                { status: 500 }
            )
        }

        // Transform data using shared utility
        const transformedData = transformContentArray(data as DbContent[])

        return NextResponse.json({ content: transformedData }, { status: 200 })
    } catch (error) {
        logger.error('Server error in GET /api/content', error as Error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
