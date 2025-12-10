/**
 * Supabase Auth Helper Functions
 */

import { supabase } from './supabase'

/**
 * Get current user session
 */
export async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user ?? null
}

/**
 * Get current session
 */
export async function getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
    const user = await getCurrentUser()
    return user?.user_metadata?.role === 'admin'
}

/**
 * Get user ID
 */
export async function getUserId() {
    const user = await getCurrentUser()
    return user?.id ?? null
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
    email: string,
    password: string,
    metadata?: { name?: string; role?: string }
) {
    return await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
        },
    })
}

/**
 * Sign out
 */
export async function signOut() {
    return await supabase.auth.signOut()
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    })
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
    return await supabase.auth.updateUser({ password: newPassword })
}
