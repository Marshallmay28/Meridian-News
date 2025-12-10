import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

        return NextResponse.json({ content }, { status: 200 })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
