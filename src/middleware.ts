import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that require authentication
const protectedRoutes = ['/publish', '/admin/dashboard']

// Routes that require admin role
const adminRoutes = ['/admin/dashboard']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if route needs protection
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (!isProtected) {
        return NextResponse.next()
    }

    // Get session token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    // Redirect to login if not authenticated
    if (!token) {
        const url = new URL('/auth/login', request.url)
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
    }

    // Check admin access
    if (isAdminRoute && token.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/publish/:path*',
        '/admin/:path*',
    ],
}
