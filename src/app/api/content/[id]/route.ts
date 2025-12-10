import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { transformContent, type DbContent } from '@/lib/content-transformer'
import { requireAdmin } from '@/lib/auth-middleware'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

        // Transform using shared utility
        const transformedContent = transformContent({
            ...content,
            views: (content.views || 0) + 1
        } as DbContent)

        return NextResponse.json({ content: transformedContent }, { status: 200 })
    } catch (error) {
        logger.error('Server error in GET /api/content/[id]', error as Error)
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
        // Require admin authentication
        const authResult = await requireAdmin(request)

        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error || 'Unauthorized - Admin access required' },
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
            logger.error('Delete error', error as Error)
            return NextResponse.json(
                { error: 'Failed to delete content' },
                { status: 500 }
            )
        }

        logger.info('Content deleted successfully', {
            contentId: id,
            adminId: authResult.user?.id
        })

        return NextResponse.json(
            { message: 'Content deleted successfully', deletedId: id },
            { status: 200 }
        )
    } catch (error) {
        logger.error('Server error in DELETE /api/content/[id]', error as Error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
