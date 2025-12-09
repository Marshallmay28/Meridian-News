import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client directly here to avoid import issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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
                    console.log('=== LOGIN ATTEMPT ===')
                    console.log('Email:', credentials?.email)

                    if (!credentials?.email || !credentials?.password) {
                        console.error('❌ Missing credentials')
                        return null
                    }

                    // Fetch user from database
                    console.log('🔍 Fetching user from database...')
                    const { data: user, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', credentials.email)
                        .single()

                    if (error) {
                        console.error('❌ Database error:', error.message)
                        return null
                    }

                    if (!user) {
                        console.error('❌ User not found')
                        return null
                    }

                    console.log('✅ User found:', user.email)
                    console.log('User role:', user.role)

                    // Verify password
                    console.log('🔐 Verifying password...')
                    const isValid = await compare(credentials.password, user.password_hash)

                    if (!isValid) {
                        console.error('❌ Invalid password')
                        return null
                    }

                    console.log('✅ Password valid!')
                    console.log('✅ LOGIN SUCCESSFUL')

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.avatar_url,
                    }
                } catch (error) {
                    console.error('❌ Auth error:', error)
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
                token.role = (user as any).role
                console.log('✅ JWT created for:', user.email)
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                console.log('✅ Session created for:', token.email)
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
    debug: true, // Enable debug mode
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
