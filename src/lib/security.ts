import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
    })
}

/**
 * Sanitize plain text (remove all HTML)
 */
export function sanitizeText(text: string): string {
    return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    })
}

/**
 * Escape special characters for SQL-like queries
 */
export function escapeSql(str: string): string {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
        switch (char) {
            case '\0': return '\\0'
            case '\x08': return '\\b'
            case '\x09': return '\\t'
            case '\x1a': return '\\z'
            case '\n': return '\\n'
            case '\r': return '\\r'
            case '"':
            case "'":
            case '\\':
            case '%': return '\\' + char
            default: return char
        }
    })
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
    const sanitized = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(sanitized)) {
        throw new Error('Invalid email format')
    }

    return sanitized
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
    const sanitized = url.trim()

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
    const lowerUrl = sanitized.toLowerCase()

    for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
            throw new Error('Invalid URL protocol')
        }
    }

    // Ensure it's a valid URL
    try {
        new URL(sanitized)
        return sanitized
    } catch {
        throw new Error('Invalid URL format')
    }
}

/**
 * Remove potentially dangerous characters from filenames
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 255)
}

/**
 * Sanitize object by applying sanitization to all string values
 */
export function sanitizeObject<T extends Record<string, any>>(
    obj: T,
    options: {
        html?: string[]
        text?: string[]
        url?: string[]
        email?: string[]
    } = {}
): T {
    const result = { ...obj }

    for (const key in result) {
        const value = result[key]

        if (typeof value === 'string') {
            if (options.html?.includes(key)) {
                result[key] = sanitizeHtml(value) as any
            } else if (options.text?.includes(key)) {
                result[key] = sanitizeText(value) as any
            } else if (options.url?.includes(key)) {
                try {
                    result[key] = sanitizeUrl(value) as any
                } catch {
                    result[key] = '' as any
                }
            } else if (options.email?.includes(key)) {
                try {
                    result[key] = sanitizeEmail(value) as any
                } catch {
                    result[key] = '' as any
                }
            } else {
                // Default: sanitize as text
                result[key] = sanitizeText(value) as any
            }
        }
    }

    return result
}

/**
 * Content Security Policy headers
 */
export const cspHeader = {
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: http:",
        "connect-src 'self' https://*.supabase.co",
        "frame-ancestors 'none'",
    ].join('; '),
}

/**
 * Security headers for API responses
 */
export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...cspHeader,
}
