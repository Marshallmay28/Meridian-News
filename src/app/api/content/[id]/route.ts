import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getToken } from 'next-auth/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // Fetch content
        const { data: content, error } = await supabase
            .from('content')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !content) {
            return NextResponse.json(
                { error: 'Content not found' },
                { status: 404 }
            )
        }

        // Increment view count
        await supabase
            .from('content')
            .update({ views: (content.views || 0) + 1 })
            .eq('id', id)

        // Transform snake_case to camelCase for frontend
        const transformedContent = {
            id: content.id,
            userId: content.user_id,
            headline: content.headline,
            content: content.content,
            author: content.author,
            category: content.category,
            mediaType: content.media_type,
            publishedAt: content.published_at,
            views: (content.views || 0) + 1, // Include the incremented view
            likes: content.likes || 0,
            readTime: content.read_time,
            isAI: content.is_ai || false,
            tags: content.tags || [],
            image: content.image,
            videoUrl: content.video_url,
            thumbnailUrl: content.thumbnail_url,
            duration: content.duration,
            resolution: content.resolution,
            fileSize: content.file_size,
            audioUrl: content.audio_url,
            coverImageUrl: content.cover_image_url,
            episodeNumber: content.episode_number,
            seasonNumber: content.season_number,
            transcript: content.transcript,
            description: content.description
        }

        return NextResponse.json({ content: transformedContent }, { status: 200 })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication and admin role
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

        if (!token || token.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 }
            )
        }

        const { id } = params

        // Delete content
        const { error } = await supabase
            .from('content')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Delete error:', error)
            return NextResponse.json(
                { error: 'Failed to delete content' },
                { status: 500 }
            )
        }

        console.log(`Content deleted successfully: ${id}`)

        return NextResponse.json(
            { message: 'Content deleted successfully', deletedId: id },
            { status: 200 }
        )
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
