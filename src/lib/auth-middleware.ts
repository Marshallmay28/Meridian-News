/**
 * Authentication Middleware
 * Provides utilities for protecting API routes with authentication and role-based access control
 */

import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export interface AuthUser {
    id: string
    email: string
    name: string
    role: 'admin' | 'user'
}

export interface AuthResult {
    authenticated: boolean
    user?: AuthUser
    error?: string
}

/**
 * Get authenticated user from request
 */
export async function getAuthUser(request: NextRequest): Promise<AuthResult> {
    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        })

        if (!token) {
            return {
                authenticated: false,
                error: 'Not authenticated'
            }
        }

        return {
            authenticated: true,
            user: {
                id: token.sub as string,
                email: token.email as string,
                name: token.name as string,
                role: (token.role as 'admin' | 'user') || 'user'
            }
        }
    } catch (error) {
        return {
            authenticated: false,
            error: 'Authentication failed'
        }
    }
}

/**
 * Check if user has admin role
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
    const authResult = await getAuthUser(request)

    if (!authResult.authenticated) {
        return authResult
    }

    if (authResult.user?.role !== 'admin') {
        return {
            authenticated: false,
            error: 'Admin access required'
        }
    }

    return authResult
}

/**
 * Check if user is authenticated (any role)
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
    return getAuthUser(request)
}
