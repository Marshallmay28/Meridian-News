import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-middleware'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        // Optional: Require authentication
        const authResult = await requireAuth(request)
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { path, contentType } = body

        if (!path) {
            return NextResponse.json({ error: 'Path is required' }, { status: 400 })
        }

        // Generate signed upload URL
        // This allows the client to upload to this specific path without generic RLS insert permissions
        const { data, error } = await supabaseAdmin
            .storage
            .from('media')
            .createSignedUploadUrl(path)

        if (error) {
            console.error('Error creating signed url:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
