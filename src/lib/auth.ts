// Re-export Supabase auth functions for convenience
export { useAuth } from '@/contexts/auth-context'
export { getCurrentUser, getCurrentSession, isAdmin, getUserId } from './supabase-auth'
