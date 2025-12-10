/**
 * Auth Middleware for API Routes
 * Uses Supabase Auth
 */

import { NextRequest } from 'next/server'
import { supabase } from './supabase'
import { logger } from './logger'

interface AuthResult {
    authenticated: boolean
    user?: any
    error?: string
}

/**
 * Get authenticated user from request
 */
export async function getAuthUser(request: NextRequest): Promise<AuthResult> {
    try {
        // Get auth header
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return { authenticated: false, error: 'No authorization header' }
        }

        const token = authHeader.replace('Bearer ', '')

        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return { authenticated: false, error: 'Invalid token' }
        }

        return {
            authenticated: true,
            user,
        }
    } catch (error) {
        logger.error('Auth error', error as Error)
        return { authenticated: false, error: 'Authentication failed' }
    }
}

/**
 * Require authentication
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
    const result = await getAuthUser(request)

    if (!result.authenticated) {
        logger.warn('Unauthorized access attempt')
    }

    return result
}

/**
 * Require admin role
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
    const result = await getAuthUser(request)

    if (!result.authenticated) {
        return result
    }

    const isAdmin = result.user?.user_metadata?.role === 'admin'

    if (!isAdmin) {
        logger.warn('Non-admin access attempt', { userId: result.user?.id })
        return {
            authenticated: false,
            error: 'Admin access required',
        }
    }

    return result
}
