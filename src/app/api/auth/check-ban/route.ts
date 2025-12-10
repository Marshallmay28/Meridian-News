
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        // List users by email (admin only)
        // Note: listUsers() doesn't filter by email directly in all versions, 
        // but let's try to find the user.
        // Actually, Supabase Admin listUsers supports page/perPage.
        // We can't search by email efficiently without scrolling.
        // BUT getUserById requires ID.
        // WE CAN use `supabaseAdmin.rpc` if we had a function, OR assume we can scan.
        // Better: `supabaseAdmin.from('users').select('*').eq('email', email)` 
        // IF the users table is exposed to admin (it usually is in `auth.users` schema, but direct access via client depends on mapping).
        // Standard Supabase client doesn't access `auth` schema directly via `.from()`.

        // WORKAROUND: Use `listUsers` and filter? Slow if many users.
        // ALTERNATIVE: Attempt to sign in usually tells us.

        // Let's use `admin.listUsers` with query?
        // Current Supabase JS: `listUsers({ query: email })` works!

        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

        if (error) throw error

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase()) as any

        if (user && user.banned_until && new Date(user.banned_until) > new Date()) {
            return NextResponse.json({
                banned: true,
                reason: user.user_metadata?.ban_reason || 'No reason provided.'
            })
        }

        return NextResponse.json({ banned: false })

    } catch (error) {
        console.error('Check ban error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
