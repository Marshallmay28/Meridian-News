'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: User | null
    session: Session | null
    isAdmin: boolean
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // Check if user is admin
    const isAdmin = user?.user_metadata?.role === 'admin'

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
        console.log('[Auth] Attempting sign in for:', email)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('[Auth] Sign in error:', error)
                throw error
            }

            console.log('[Auth] Sign in successful:', data)
            router.push('/')
            return { error: null }
        } catch (error) {
            console.error('[Auth] Sign in exception:', error)
            return { error: error as Error }
        }
    }

    const signUp = async (email: string, password: string, name: string) => {
        console.log('[Auth] Attempting sign up for:', email)
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role: 'user', // Default role
                    },
                },
            })

            if (error) {
                console.error('[Auth] Sign up error:', error)
                throw error
            }

            console.log('[Auth] Sign up successful:', data)
            router.push('/auth/login')
            return { error: null }
        } catch (error) {
            console.error('[Auth] Sign up exception:', error)
            return { error: error as Error }
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    const value = {
        user,
        session,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
