'use client'

import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        toast.success('Message sent! We\'ll get back to you soon.')
        setFormData({ name: '', email: '', subject: '', message: '' })
    }

    return (
        <PageLayout showBackButton title="Contact Us">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-3xl font-serif">Get in Touch</CardTitle>
                        <CardDescription>
                            Have questions or feedback? We'd love to hear from you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your name"
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Subject</label>
                                <Input
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="What's this about?"
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Message</label>
                                <Textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Tell us more..."
                                    required
                                    rows={6}
                                    className="mt-1"
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                <Send className="w-4 h-4 mr-2" />
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="glass-card">
                        <CardHeader>
                            <Mail className="w-6 h-6 text-blue-600 mb-2" />
                            <CardTitle className="text-lg">Email</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">support@meridianpost.com</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
                            <CardTitle className="text-lg">Community</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Join our Discord server</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageLayout>
    )
}
