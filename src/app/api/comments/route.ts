import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { commentSchema, validateRequest } from '@/lib/validations'

// GET /api/comments - Fetch comments for content
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const contentType = searchParams.get('contentType')
        const contentId = searchParams.get('contentId')

        if (!contentType || !contentId) {
            return NextResponse.json(
                { error: 'contentType and contentId are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('comments')
            .select('*, users(name, avatar_url)')
            .eq('content_type', contentType)
            .eq('content_id', contentId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
        }

        return NextResponse.json({ comments: data })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/comments - Create new comment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate request body
        const validationResult = validateRequest(commentSchema, body)
        if (!validationResult.success) {
            return NextResponse.json({ error: validationResult.error }, { status: 400 })
        }

        const commentData = validationResult.data

        // TODO: Get user ID from session (will be implemented in Phase 2)
        const userId = request.headers.get('x-user-id') || 'anonymous'

        // Insert comment
        const { data, error } = await supabase
            .from('comments')
            .insert({
                user_id: userId,
                content_type: commentData.contentType,
                content_id: commentData.contentId,
                author_name: commentData.authorName,
                content: commentData.content,
            })
            .select()
            .single()

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
        }

        return NextResponse.json({ comment: data }, { status: 201 })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
