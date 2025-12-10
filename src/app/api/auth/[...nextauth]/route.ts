import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        logger.warn('Login attempt with missing credentials')
                        return null
                    }

                    // Fetch user from database
                    const { data: user, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', credentials.email)
                        .single()

                    if (error) {
                        logger.error('Database error during login', error as Error, { email: credentials.email })
                        return null
                    }

                    if (!user) {
                        logger.warn('Login attempt for non-existent user', { email: credentials.email })
                        return null
                    }

                    // Verify password
                    const isValid = await compare(credentials.password, user.password_hash)

                    if (!isValid) {
                        logger.warn('Invalid password attempt', { email: credentials.email })
                        return null
                    }

                    logger.info('Successful login', { email: user.email, role: user.role })

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.avatar_url,
                    }
                } catch (error) {
                    logger.error('Authentication error', error as Error)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string
                session.user.role = token.role as 'admin' | 'user'
                session.user.email = token.email as string
                session.user.name = token.name as string
            }
            return session
        },
    },
    pages: {
        signIn: '/auth/login',
        signOut: '/auth/login',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development', // Only enable debug in development
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
