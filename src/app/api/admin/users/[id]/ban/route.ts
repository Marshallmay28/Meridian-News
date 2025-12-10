import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-middleware'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST(
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

        const body = await request.json()
        const { banned, banReason } = body

        // If banned is true, ban for 100 years. If false, remove ban.
        const banDuration = banned ? '876600h' : 'none'

        // Update user: Set ban duration AND update metadata with reason (if banning) or clear it (if unbanning)
        const updateData: any = { ban_duration: banDuration }

        if (banned && banReason) {
            updateData.user_metadata = { ban_reason: banReason }
        } else if (!banned) {
            // Optional: Clear ban reason when unbanning. 
            // Note: Supabase merge metadata by default, so we might need to set it to null explicitly if we want to remove it.
            updateData.user_metadata = { ban_reason: null }
        }

        const { data: user, error } = await supabaseAdmin.auth.admin.updateUserById(
            id,
            updateData
        )

        if (error) {
            throw error
        }

        logger.info(`User ${id} ban status updated to ${banned}`)

        return NextResponse.json({
            success: true,
            user: {
                id: user.user.id,
                banned: banned
            }
        })
    } catch (error) {
        logger.error('Error updating ban status', error as Error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
