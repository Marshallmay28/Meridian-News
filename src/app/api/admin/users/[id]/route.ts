import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
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

        const userId = params.id

        // Prevent admin from deleting themselves
        if (userId === user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // Delete user from Supabase Auth
        // This will cascade delete all user content via FK constraints
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (deleteError) {
            console.error('Error deleting user:', deleteError)
            return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        }, { status: 200 })
    } catch (error) {
        console.error('Error in DELETE /api/admin/users/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
