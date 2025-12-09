type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
    level: LogLevel
    message: string
    timestamp: string
    context?: Record<string, any>
    error?: Error
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development'

    private formatMessage(entry: LogEntry): string {
        const { level, message, timestamp, context } = entry
        let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`

        if (context && Object.keys(context).length > 0) {
            formatted += `\nContext: ${JSON.stringify(context, null, 2)}`
        }

        return formatted
    }

    private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            error,
        }

        // Console logging
        const formatted = this.formatMessage(entry)

        switch (level) {
            case 'error':
                console.error(formatted, error)
                break
            case 'warn':
                console.warn(formatted)
                break
            case 'debug':
                if (this.isDevelopment) {
                    console.debug(formatted)
                }
                break
            default:
                console.log(formatted)
        }

        // TODO: Send to external logging service (Sentry, LogRocket, etc.)
        if (!this.isDevelopment && level === 'error') {
            this.sendToExternalService(entry)
        }
    }

    private async sendToExternalService(entry: LogEntry) {
        // Placeholder for external logging service integration
        // Example: Sentry, LogRocket, Datadog, etc.

        /*
        if (typeof window !== 'undefined' && window.Sentry) {
          window.Sentry.captureException(entry.error || new Error(entry.message), {
            level: entry.level,
            extra: entry.context,
          })
        }
        */
    }

    info(message: string, context?: Record<string, any>) {
        this.log('info', message, context)
    }

    warn(message: string, context?: Record<string, any>) {
        this.log('warn', message, context)
    }

    error(message: string, error?: Error, context?: Record<string, any>) {
        this.log('error', message, context, error)
    }

    debug(message: string, context?: Record<string, any>) {
        this.log('debug', message, context)
    }

    // API error logging helper
    apiError(endpoint: string, error: Error, context?: Record<string, any>) {
        this.error(`API Error: ${endpoint}`, error, {
            endpoint,
            ...context,
        })
    }

    // Database error logging helper
    dbError(operation: string, error: Error, context?: Record<string, any>) {
        this.error(`Database Error: ${operation}`, error, {
            operation,
            ...context,
        })
    }

    // Auth error logging helper
    authError(action: string, error: Error, context?: Record<string, any>) {
        this.error(`Auth Error: ${action}`, error, {
            action,
            ...context,
        })
    }
}

// Export singleton instance
export const logger = new Logger()

// Error boundary helper
export function logErrorBoundary(error: Error, errorInfo: { componentStack: string }) {
    logger.error('React Error Boundary', error, {
        componentStack: errorInfo.componentStack,
    })
}

// Unhandled promise rejection handler
if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        logger.error('Unhandled Promise Rejection', event.reason, {
            promise: event.promise,
        })
    })
}
