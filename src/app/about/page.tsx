'use client'

import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Users, Target, Zap } from 'lucide-react'

export default function AboutPage() {
    return (
        <PageLayout showBackButton title="About Us">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-3xl font-serif">About Meridian Post</CardTitle>
                        <CardDescription>AI-Powered News Platform for Everyone</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                            Meridian Post is democratizing journalism with AI-powered tools and an open platform for all voices.
                            We believe that everyone has a story to tell, and we're here to help you share it with the world.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Created by Forsight Group in 2025, our mission is to empower content creators with cutting-edge AI technology
                            while maintaining the human touch that makes journalism meaningful.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="glass-card">
                        <CardHeader>
                            <Brain className="w-8 h-8 text-blue-600 mb-2" />
                            <CardTitle>AI-Powered</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Leverage advanced AI to generate, edit, and enhance your content with ease.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <Users className="w-8 h-8 text-purple-600 mb-2" />
                            <CardTitle>Community-Driven</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Join a vibrant community of writers, journalists, and content creators.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <Target className="w-8 h-8 text-green-600 mb-2" />
                            <CardTitle>Open Platform</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Publish articles, videos, and podcasts without barriers or gatekeepers.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <Zap className="w-8 h-8 text-yellow-600 mb-2" />
                            <CardTitle>Fast & Reliable</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Built on modern technology for speed, reliability, and scalability.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageLayout>
    )
}
