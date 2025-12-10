import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Get request body
        const body = await request.json()
        const { banned } = body

        const userId = params.id

        // Update user ban status
        if (banned) {
            // Ban user for 100 years (effectively permanent)
            const banUntil = new Date()
            banUntil.setFullYear(banUntil.getFullYear() + 100)

            const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { ban_duration: '876000h' } // 100 years in hours
            )

            if (banError) {
                console.error('Error banning user:', banError)
                return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 })
            }
        } else {
            // Unban user
            const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { ban_duration: 'none' }
            )

            if (unbanError) {
                console.error('Error unbanning user:', unbanError)
                return NextResponse.json({ error: 'Failed to unban user' }, { status: 500 })
            }
        }

        return NextResponse.json({
            success: true,
            message: banned ? 'User banned successfully' : 'User unbanned successfully'
        }, { status: 200 })
    } catch (error) {
        console.error('Error in POST /api/admin/users/[id]/ban:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
