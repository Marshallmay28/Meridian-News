import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { transformContent, type DbContent } from '@/lib/content-transformer'
import { requireAdmin } from '@/lib/auth-middleware'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const { id } = params

        // Fetch content using Admin client to ensure we can read it regardless of RLS
        // The policy is "public read", but this is safer and consistent
        const { data: content, error } = await supabaseAdmin
            .from('content')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !content) {
            console.error('Error fetching content:', error)
            return NextResponse.json(
                { error: 'Content not found' },
                { status: 404 }
            )
        }

        // Increment view count using Admin client
        // This is crucial because normal users DON'T have permission to UPDATE the content
        // even just to increment views. We must use the service role key.
        await supabaseAdmin
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

// DELETE handler
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        // Require admin authentication
        const authResult = await requireAdmin(request)

        // DEBUG: Check if Service Role Key is configured
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            logger.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing. Admin deletion will likely fail due to RLS.')
            return NextResponse.json(
                { error: 'Server misconfiguration: Missing admin privileges' },
                { status: 500 }
            )
        }

        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error || 'Unauthorized - Admin or Owner access required' },
                { status: 403 }
            )
        }

        const params = await props.params
        const { id } = params
        const user = authResult.user

        // If not admin, check ownership
        if (!user?.app_metadata?.claims?.admin && user?.user_metadata?.role !== 'admin') {
            const { data: contentToCheck } = await supabaseAdmin
                .from('content')
                .select('user_id')
                .eq('id', id)
                .single()

            if (!contentToCheck || contentToCheck.user_id !== user.id) {
                return NextResponse.json(
                    { error: 'Unauthorized - You can only delete your own content' },
                    { status: 403 }
                )
            }
        }

        // Update: Cascade delete related items manually to avoid FK constraints
        // 1. Delete comments
        const { error: commentsError } = await supabaseAdmin
            .from('comments')
            .delete()
            .eq('content_id', id)

        if (commentsError) {
            logger.warn('Error deleting comments during cascade', commentsError)
            // Continue anyway, as it might not prevent content deletion if optional
        }

        // 2. Delete content
        const { error } = await supabaseAdmin
            .from('content')
            .delete()
            .eq('id', id)

        if (error) {
            logger.error('Delete error', error as Error)
            return NextResponse.json(
                { error: 'Failed to delete content. It may have related records.' },
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
