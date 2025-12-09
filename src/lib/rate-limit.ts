// Simple in-memory rate limiter (for development)
// For production, use Redis-based solution like @upstash/ratelimit

interface RateLimitStore {
    [key: string]: {
        count: number
        resetTime: number
    }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key]
        }
    })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
    interval: number // in milliseconds
    maxRequests: number
}

export interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    reset: number
}

export function rateLimit(
    identifier: string,
    config: RateLimitConfig = { interval: 60000, maxRequests: 10 }
): RateLimitResult {
    const now = Date.now()
    const key = identifier

    // Initialize or get existing record
    if (!store[key] || store[key].resetTime < now) {
        store[key] = {
            count: 0,
            resetTime: now + config.interval,
        }
    }

    const record = store[key]
    const remaining = Math.max(0, config.maxRequests - record.count - 1)

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
        return {
            success: false,
            limit: config.maxRequests,
            remaining: 0,
            reset: record.resetTime,
        }
    }

    // Increment count
    record.count++

    return {
        success: true,
        limit: config.maxRequests,
        remaining,
        reset: record.resetTime,
    }
}

// Helper to get client IP
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    if (realIp) {
        return realIp
    }

    return 'unknown'
}

// Preset rate limit configs
export const rateLimitConfigs = {
    // Strict limits for auth endpoints
    auth: { interval: 60000, maxRequests: 5 }, // 5 per minute

    // Moderate limits for content creation
    create: { interval: 60000, maxRequests: 10 }, // 10 per minute

    // Generous limits for reading
    read: { interval: 60000, maxRequests: 100 }, // 100 per minute

    // Very strict for admin operations
    admin: { interval: 60000, maxRequests: 20 }, // 20 per minute
}
