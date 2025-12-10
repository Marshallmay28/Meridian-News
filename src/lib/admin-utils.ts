// Admin utilities for Meridian Post
import { Content, getAllContent, getContentStorageKey } from './content-models'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'meridian2025' // Fallback for development
const ADMIN_SESSION_KEY = 'meridianAdminSession'

export interface ContentStats {
    total: number
    articles: number
    videos: number
    podcasts: number
    aiGenerated: number
    userGenerated: number
    todayPosts: number
    totalViews: number
    totalLikes: number
}

// Authentication
export const isAdmin = (): boolean => {
    if (typeof window === 'undefined') return false
    const session = localStorage.getItem(ADMIN_SESSION_KEY)
    return session === 'authenticated'
}

export const loginAdmin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem(ADMIN_SESSION_KEY, 'authenticated')
        return true
    }
    return false
}

export const logoutAdmin = (): void => {
    localStorage.removeItem(ADMIN_SESSION_KEY)
}

// Content Management
export const deleteContentById = (id: string): void => {
    if (typeof window === 'undefined') return

    // Try all storage keys
    const keys = ['meridianArticles', 'meridianVideos', 'meridianPodcasts']

    keys.forEach(key => {
        const content = JSON.parse(localStorage.getItem(key) || '[]')
        const filtered = content.filter((item: Content) => item.id !== id)
        if (filtered.length !== content.length) {
            localStorage.setItem(key, JSON.stringify(filtered))
        }
    })
}

export const bulkDeleteContent = (ids: string[]): void => {
    ids.forEach(id => deleteContentById(id))
}

export const deleteAllAIContent = async (): Promise<void> => {
    if (typeof window === 'undefined') return

    const keys = ['meridianArticles', 'meridianVideos', 'meridianPodcasts']

    // Clean up localStorage
    keys.forEach(key => {
        const content = JSON.parse(localStorage.getItem(key) || '[]')
        const filtered = content.filter((item: Content) => !item.isAI)
        localStorage.setItem(key, JSON.stringify(filtered))
    })
}

export const deleteAllUserContent = async (): Promise<void> => {
    if (typeof window === 'undefined') return

    const keys = ['meridianArticles', 'meridianVideos', 'meridianPodcasts']

    // Clean up localStorage
    keys.forEach(key => {
        const content = JSON.parse(localStorage.getItem(key) || '[]')
        const filtered = content.filter((item: Content) => item.isAI)
        localStorage.setItem(key, JSON.stringify(filtered))
    })
}

// Statistics
export const getContentStats = (): ContentStats => {
    const allContent = getAllContent()
    const today = new Date().toDateString()

    return {
        total: allContent.length,
        articles: allContent.filter(c => c.mediaType === 'article').length,
        videos: allContent.filter(c => c.mediaType === 'video').length,
        podcasts: allContent.filter(c => c.mediaType === 'podcast').length,
        aiGenerated: allContent.filter(c => c.isAI).length,
        userGenerated: allContent.filter(c => !c.isAI).length,
        todayPosts: allContent.filter(c => new Date(c.publishedAt).toDateString() === today).length,
        totalViews: allContent.reduce((sum, c) => sum + c.views, 0),
        totalLikes: allContent.reduce((sum, c) => sum + c.likes, 0)
    }
}

export const getDeviceStats = (): { deviceId: string; count: number }[] => {
    const allContent = getAllContent()
    const deviceMap = new Map<string, number>()

    allContent.forEach(content => {
        const count = deviceMap.get(content.deviceId) || 0
        deviceMap.set(content.deviceId, count + 1)
    })

    return Array.from(deviceMap.entries())
        .map(([deviceId, count]) => ({ deviceId, count }))
        .sort((a, b) => b.count - a.count)
}

// Platform Settings
export interface PlatformSettings {
    dailyLimit: number
    aiEnabled: boolean
    allowVideos: boolean
    allowPodcasts: boolean
    moderationEnabled: boolean
}

const SETTINGS_KEY = 'meridianPlatformSettings'

export const getPlatformSettings = (): PlatformSettings => {
    if (typeof window === 'undefined') {
        return {
            dailyLimit: 3,
            aiEnabled: true,
            allowVideos: true,
            allowPodcasts: true,
            moderationEnabled: false
        }
    }

    const settings = localStorage.getItem(SETTINGS_KEY)
    return settings ? JSON.parse(settings) : {
        dailyLimit: 3,
        aiEnabled: true,
        allowVideos: true,
        allowPodcasts: true,
        moderationEnabled: false
    }
}

export const savePlatformSettings = (settings: PlatformSettings): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
