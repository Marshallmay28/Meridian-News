import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-middleware'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAdmin(request)
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

        if (error) {
            throw error
        }

        // Transform users to match UI expectations
        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'Unknown',
            role: user.user_metadata?.role || 'user',
            created_at: user.created_at,
            banned: !!user.banned_until && new Date(user.banned_until) > new Date(),
            email_confirmed: !!user.email_confirmed_at,
            last_sign_in: user.last_sign_in_at
        }))

        return NextResponse.json({ users: formattedUsers })
    } catch (error) {
        logger.error('Error fetching users', error as Error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
