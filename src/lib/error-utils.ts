// User-friendly error messages
export const errorMessages = {
    // Network errors
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',

    // Auth errors
    UNAUTHORIZED: 'Please sign in to continue.',
    FORBIDDEN: 'You don\'t have permission to access this resource.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
    INVALID_CREDENTIALS: 'Invalid email or password.',

    // Validation errors
    VALIDATION_ERROR: 'Please check your input and try again.',
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',

    // Rate limiting
    RATE_LIMIT: 'Too many requests. Please slow down and try again later.',

    // Database errors
    NOT_FOUND: 'The requested resource was not found.',
    ALREADY_EXISTS: 'This resource already exists.',
    DATABASE_ERROR: 'A database error occurred. Please try again.',

    // Generic errors
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    SERVER_ERROR: 'Server error. Our team has been notified.',
}

// Map error codes to user-friendly messages
export function getUserFriendlyError(error: any): string {
    // Network errors
    if (!navigator.onLine) {
        return errorMessages.NETWORK_ERROR
    }

    // HTTP status codes
    if (error.status || error.response?.status) {
        const status = error.status || error.response.status

        switch (status) {
            case 400:
                return errorMessages.VALIDATION_ERROR
            case 401:
                return errorMessages.UNAUTHORIZED
            case 403:
                return errorMessages.FORBIDDEN
            case 404:
                return errorMessages.NOT_FOUND
            case 409:
                return errorMessages.ALREADY_EXISTS
            case 429:
                return errorMessages.RATE_LIMIT
            case 500:
            case 502:
            case 503:
                return errorMessages.SERVER_ERROR
            default:
                return errorMessages.UNKNOWN_ERROR
        }
    }

    // Error messages from API
    if (error.message) {
        const msg = error.message.toLowerCase()

        if (msg.includes('network') || msg.includes('fetch')) {
            return errorMessages.NETWORK_ERROR
        }
        if (msg.includes('timeout')) {
            return errorMessages.TIMEOUT
        }
        if (msg.includes('unauthorized') || msg.includes('not authenticated')) {
            return errorMessages.UNAUTHORIZED
        }
        if (msg.includes('forbidden') || msg.includes('permission')) {
            return errorMessages.FORBIDDEN
        }
        if (msg.includes('not found')) {
            return errorMessages.NOT_FOUND
        }
        if (msg.includes('already exists') || msg.includes('duplicate')) {
            return errorMessages.ALREADY_EXISTS
        }
        if (msg.includes('rate limit')) {
            return errorMessages.RATE_LIMIT
        }
    }

    return errorMessages.UNKNOWN_ERROR
}

// Retry logic helper
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
): Promise<T> {
    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error as Error

            // Don't retry on client errors (4xx)
            if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as any).status
                if (status >= 400 && status < 500) {
                    throw error
                }
            }

            // Wait before retrying
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
            }
        }
    }

    throw lastError!
}
