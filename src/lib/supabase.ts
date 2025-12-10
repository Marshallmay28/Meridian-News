import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check that .env.local exists and contains:\n' +
        'NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n' +
        'Current values:\n' +
        `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl || 'undefined'}\n` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'set' : 'undefined'}`
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key (for admin operations)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : supabase // Fallback to regular client if service role key is not set

// Type definitions for database tables
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    password_hash: string
                    name: string
                    role: 'user' | 'admin'
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    password_hash: string
                    name: string
                    role?: 'user' | 'admin'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    password_hash?: string
                    name?: string
                    role?: 'user' | 'admin'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            articles: {
                Row: {
                    id: string
                    user_id: string
                    headline: string
                    content: string
                    image: string | null
                    category: string
                    tags: string[]
                    views: number
                    likes: number
                    read_time: number
                    is_ai: boolean
                    ai_signature: string | null
                    confidence: number | null
                    published_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    headline: string
                    content: string
                    image?: string | null
                    category: string
                    tags?: string[]
                    views?: number
                    likes?: number
                    read_time?: number
                    is_ai?: boolean
                    ai_signature?: string | null
                    confidence?: number | null
                    published_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    headline?: string
                    content?: string
                    image?: string | null
                    category?: string
                    tags?: string[]
                    views?: number
                    likes?: number
                    read_time?: number
                    is_ai?: boolean
                    ai_signature?: string | null
                    confidence?: number | null
                    published_at?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            // Add other table types as needed
        }
    }
}
