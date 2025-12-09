import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { updateArticleSchema, validateRequest } from '@/lib/validations'

// GET /api/articles/[id] - Fetch single article
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*, users(name, email, avatar_url)')
            .eq('id', params.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Article not found' }, { status: 404 })
            }
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
        }

        // Increment view count
        await supabase
            .from('articles')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', params.id)

        return NextResponse.json({ article: { ...data, views: (data.views || 0) + 1 } })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT /api/articles/[id] - Update article
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()

        // Validate request body
        const validationResult = validateRequest(updateArticleSchema, body)
        if (!validationResult.success) {
            return NextResponse.json({ error: validationResult.error }, { status: 400 })
        }

        const updates = validationResult.data

        // TODO: Check if user owns this article (will be implemented in Phase 2)
        const userId = request.headers.get('x-user-id')

        // Update article
        const { data, error } = await supabase
            .from('articles')
            .update(updates)
            .eq('id', params.id)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Article not found' }, { status: 404 })
            }
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
        }

        return NextResponse.json({ article: data })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // TODO: Check if user owns this article or is admin (will be implemented in Phase 2)
        const userId = request.headers.get('x-user-id')

        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', params.id)

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Article deleted successfully' })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/articles/[id]/like - Like article
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('likes')
            .eq('id', params.id)
            .single()

        if (error) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        const { error: updateError } = await supabase
            .from('articles')
            .update({ likes: (data.likes || 0) + 1 })
            .eq('id', params.id)

        if (updateError) {
            return NextResponse.json({ error: 'Failed to like article' }, { status: 500 })
        }

        return NextResponse.json({ likes: (data.likes || 0) + 1 })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
