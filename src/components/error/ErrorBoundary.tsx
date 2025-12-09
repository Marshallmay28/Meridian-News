'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/logger'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        logger.error('Component Error Boundary', error, {
            componentStack: errorInfo.componentStack,
        })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Card className="border-red-200 dark:border-red-800">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <CardTitle className="text-lg">Something went wrong</CardTitle>
                        </div>
                        <CardDescription>
                            This component encountered an error and couldn't render.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
                                <p className="text-sm font-mono text-red-800 dark:text-red-200">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <Button
                            onClick={() => this.setState({ hasError: false })}
                            variant="outline"
                            size="sm"
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )
        }

        return this.props.children
    }
}
