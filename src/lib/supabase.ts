import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key (for admin operations)
export const supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

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
