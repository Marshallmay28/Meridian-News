import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { userSchema, validateRequest } from '@/lib/validations'
import { rateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'
import { sanitizeEmail, securityHeaders } from '@/lib/security'

// Ensure this route works on Vercel
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIp(request)
        const rateLimitResult = rateLimit(`register:${ip}`, rateLimitConfigs.auth)

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
                        ...securityHeaders,
                    }
                }
            )
        }

        const body = await request.json()

        // Validate request
        const validationResult = validateRequest(userSchema, body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error },
                { status: 400, headers: securityHeaders }
            )
        }

        const { email, password, name } = validationResult.data

        // Sanitize email
        const sanitizedEmail = sanitizeEmail(email)

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', sanitizedEmail)
            .single()

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409, headers: securityHeaders }
            )
        }

        // Hash password
        const passwordHash = await hash(password, 12)

        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert({
                email: sanitizedEmail,
                password_hash: passwordHash,
                name,
                role: 'user',
            })
            .select('id, email, name, role')
            .single()

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500, headers: securityHeaders }
            )
        }

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            },
            { status: 201, headers: securityHeaders }
        )
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: securityHeaders }
        )
    }
}
