import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        // Get authorization header
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
        }

        // Verify the user is an admin
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const isAdmin = user.user_metadata?.role === 'admin'
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
        }

        // Get all users from Supabase Auth
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

        if (usersError) {
            console.error('Error fetching users:', usersError)
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
        }

        // Format user data
        const formattedUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.user_metadata?.name || 'Unknown',
            role: u.user_metadata?.role || 'user',
            created_at: u.created_at,
            banned: u.banned_until ? new Date(u.banned_until) > new Date() : false,
            email_confirmed: !!u.email_confirmed_at,
            last_sign_in: u.last_sign_in_at
        }))

        return NextResponse.json({ users: formattedUsers }, { status: 200 })
    } catch (error) {
        console.error('Error in GET /api/admin/users:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
