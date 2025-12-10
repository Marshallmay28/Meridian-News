'use client'

import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
    return (
        <PageLayout showBackButton title="Privacy Policy">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-3xl font-serif">Privacy Policy</CardTitle>
                        <CardDescription>Last updated: December 2025</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 prose dark:prose-invert max-w-none">
                        <section>
                            <h3 className="text-xl font-semibold mb-2">1. Information We Collect</h3>
                            <p className="text-muted-foreground">
                                We collect information you provide directly to us, including your name, email address,
                                and content you publish on our platform.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-2">2. How We Use Your Information</h3>
                            <p className="text-muted-foreground">
                                We use the information we collect to provide, maintain, and improve our services,
                                to communicate with you, and to protect our users.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-2">3. Data Storage</h3>
                            <p className="text-muted-foreground">
                                Your data is securely stored using industry-standard encryption and security practices.
                                We use Supabase for database storage with end-to-end encryption.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-2">4. Your Rights</h3>
                            <p className="text-muted-foreground">
                                You have the right to access, update, or delete your personal information at any time.
                                Contact us at privacy@meridianpost.com for assistance.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-2">5. Cookies</h3>
                            <p className="text-muted-foreground">
                                We use cookies to improve your experience and maintain your session.
                                You can control cookies through your browser settings.
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    )
}
