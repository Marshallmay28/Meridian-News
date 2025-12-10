import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-middleware'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const authResult = await requireAdmin(request)
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

        if (error) {
            throw error
        }

        logger.info(`User ${id} deleted by admin`)

        return NextResponse.json({ success: true })
    } catch (error) {
        logger.error('Error deleting user', error as Error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
