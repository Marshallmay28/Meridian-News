import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { articleSchema, validateRequest, paginationSchema } from '@/lib/validations'
import { rateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'
import { sanitizeHtml, securityHeaders } from '@/lib/security'

// GET /api/articles - Fetch articles with pagination and filters
export async function GET(request: NextRequest) {
    try {
        // Rate limiting for reads
        const ip = getClientIp(request)
        const rateLimitResult = rateLimit(`articles:read:${ip}`, rateLimitConfigs.read)

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
                    }
                }
            )
        }

        const { searchParams } = new URL(request.url)

        // Parse and validate query parameters
        const paginationResult = validateRequest(paginationSchema, {
            page: searchParams.get('page'),
            limit: searchParams.get('limit'),
        })

        if (!paginationResult.success) {
            return NextResponse.json({ error: paginationResult.error }, { status: 400 })
        }

        const { page, limit } = paginationResult.data
        const offset = (page - 1) * limit

        // Build query
        let query = supabase
            .from('articles')
            .select('*, users(name, email)', { count: 'exact' })
            .order('published_at', { ascending: false })
            .range(offset, offset + limit - 1)

        // Apply filters
        const category = searchParams.get('category')
        const isAI = searchParams.get('isAI')
        const search = searchParams.get('search')

        if (category) {
            query = query.eq('category', category)
        }

        if (isAI !== null) {
            query = query.eq('is_ai', isAI === 'true')
        }

        if (search) {
            query = query.or(`headline.ilike.%${search}%,content.ilike.%${search}%`)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
        }

        return NextResponse.json({
            articles: data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        }, { headers: securityHeaders })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/articles - Create new article
export async function POST(request: NextRequest) {
    try {
        // Rate limiting for content creation
        const ip = getClientIp(request)
        const rateLimitResult = rateLimit(`articles:create:${ip}`, rateLimitConfigs.create)

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many articles created. Please slow down.' },
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

        // Validate request body
        const validationResult = validateRequest(articleSchema, body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error },
                { status: 400, headers: securityHeaders }
            )
        }

        const articleData = validationResult.data

        // Sanitize content
        const sanitizedContent = sanitizeHtml(articleData.content)
        const sanitizedHeadline = sanitizeHtml(articleData.headline)

        // TODO: Get user ID from session (will be implemented in Phase 2)
        const userId = request.headers.get('x-user-id') || 'anonymous'

        // Calculate read time (rough estimate: 200 words per minute)
        const wordCount = sanitizedContent.split(/\s+/).length
        const readTime = Math.ceil(wordCount / 200)

        // Insert article
        const { data, error } = await supabase
            .from('articles')
            .insert({
                user_id: userId,
                headline: sanitizedHeadline,
                content: sanitizedContent,
                image: articleData.image || null,
                category: articleData.category,
                tags: articleData.tags,
                read_time: readTime,
                is_ai: articleData.isAI,
                ai_signature: articleData.aiSignature,
                confidence: articleData.confidence,
            })
            .select()
            .single()

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to create article' },
                { status: 500, headers: securityHeaders }
            )
        }

        return NextResponse.json(
            { article: data },
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
