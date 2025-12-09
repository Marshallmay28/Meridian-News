import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getSession() {
    return await getServerSession(authOptions)
}

export async function getCurrentUser() {
    const session = await getSession()
    return session?.user
}

export async function isAuthenticated() {
    const session = await getSession()
    return !!session?.user
}

export async function isAdmin() {
    const session = await getSession()
    return (session?.user as any)?.role === 'admin'
}

// Client-side hook
export { useSession } from 'next-auth/react'
