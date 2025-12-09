// User publishing quota management (Client-side only)

export interface PublishQuota {
    userId?: string
    dailyLimit: number
    publishedToday: number
    remaining: number
    lastPublishDate: string
}

// Get publish quota for display
export function getPublishQuotaDisplay(isAdmin: boolean = false): string {
    if (isAdmin) {
        return 'Unlimited (Admin)'
    }

    const quota = getLocalPublishCount()
    return `${quota.remaining} of 3 remaining today`
}

// LocalStorage for client-side tracking
export function getLocalPublishCount(): { count: number; remaining: number } {
    if (typeof window === 'undefined') {
        return { count: 0, remaining: 3 }
    }

    const today = new Date().toISOString().split('T')[0]
    const stored = localStorage.getItem('publishCount')

    if (!stored) {
        return { count: 0, remaining: 3 }
    }

    const data = JSON.parse(stored)

    // Reset if it's a new day
    if (data.date !== today) {
        localStorage.setItem('publishCount', JSON.stringify({ date: today, count: 0 }))
        return { count: 0, remaining: 3 }
    }

    return {
        count: data.count || 0,
        remaining: Math.max(0, 3 - (data.count || 0)),
    }
}

export function incrementLocalPublishCount(): void {
    if (typeof window === 'undefined') return

    const today = new Date().toISOString().split('T')[0]
    const stored = localStorage.getItem('publishCount')

    if (!stored) {
        localStorage.setItem('publishCount', JSON.stringify({ date: today, count: 1 }))
        return
    }

    const data = JSON.parse(stored)

    if (data.date !== today) {
        localStorage.setItem('publishCount', JSON.stringify({ date: today, count: 1 }))
    } else {
        localStorage.setItem('publishCount', JSON.stringify({ date: today, count: (data.count || 0) + 1 }))
    }
}

export function canPublish(isAdmin: boolean = false): boolean {
    // Admins have unlimited publishing
    if (isAdmin) {
        return true
    }

    const quota = getLocalPublishCount()
    return quota.remaining > 0
}
