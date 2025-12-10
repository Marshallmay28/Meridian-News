'use client'

import { useState } from 'react'
import { Sparkles, FileText, Video, Mic, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MediaType, saveContent, CATEGORIES } from '@/lib/content-models'
import { toast } from 'sonner'

interface AIGeneratorProps {
    onGenerated?: () => void
}

export function AIContentGenerator({ onGenerated }: AIGeneratorProps) {
    const [contentType, setContentType] = useState<MediaType>('article')
    const [topic, setTopic] = useState('')
    const [category, setCategory] = useState('technology')
    const [tone, setTone] = useState('professional')
    const [isGenerating, setIsGenerating] = useState(false)
    const [youtubeUrl, setYoutubeUrl] = useState('')
    const [audioUrl, setAudioUrl] = useState('')

    const generateContent = async () => {
        if (!topic.trim()) {
            toast.error('Please enter a topic')
            return
        }

        setIsGenerating(true)

        // Simulate AI generation delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        try {
            const contentData = {
                headline: `${topic} - AI Generated ${contentType === 'article' ? 'Article' : contentType === 'video' ? 'Video' : 'Podcast'}`,
                content: generateMockContent(topic, contentType, tone),
                author: 'AI Assistant',
                category,
                mediaType: contentType,
                readTime: contentType === 'article' ? Math.floor(Math.random() * 10) + 3 : undefined,
                isAI: true,
                tags: [topic.toLowerCase(), 'ai-generated', category],
                image: contentType === 'article' ? `https://picsum.photos/seed/${Date.now()}/1200/630` : undefined,
                videoUrl: contentType === 'video' ? (youtubeUrl || '#') : undefined,
                thumbnailUrl: contentType === 'video' ? `https://picsum.photos/seed/${Date.now()}/800/450` : undefined,
                duration: contentType !== 'article' ? Math.floor(Math.random() * 600) + 300 : undefined,
                resolution: contentType === 'video' ? '1080p' : undefined,
                audioUrl: contentType === 'podcast' ? (audioUrl || '#') : undefined,
                coverImageUrl: contentType === 'podcast' ? `https://picsum.photos/seed/${Date.now()}/400/400` : undefined,
                description: `AI-generated ${contentType} about ${topic}`,
            }

            // Save to database via API
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contentData)
            })

            if (!response.ok) {
                throw new Error('Failed to save content')
            }

            toast.success(`${contentType === 'article' ? 'Article' : contentType === 'video' ? 'Video' : 'Podcast'} generated and published successfully!`)

            // Reset form
            setTopic('')
            setYoutubeUrl('')
            setAudioUrl('')

            // Notify parent to refresh
            if (onGenerated) {
                onGenerated()
            }
        } catch (error) {
            console.error('Generation error:', error)
            toast.error('Failed to generate content')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Card className="glass-card border-purple-500/20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <CardTitle className="font-serif">AI Content Generator</CardTitle>
                </div>
                <CardDescription>
                    Generate engaging content powered by AI
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Content Type Selection */}
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        variant={contentType === 'article' ? 'default' : 'outline'}
                        onClick={() => setContentType('article')}
                        className={contentType === 'article' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Article
                    </Button>
                    <Button
                        variant={contentType === 'video' ? 'default' : 'outline'}
                        onClick={() => setContentType('video')}
                        className={contentType === 'video' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                    >
                        <Video className="w-4 h-4 mr-2" />
                        Video
                    </Button>
                    <Button
                        variant={contentType === 'podcast' ? 'default' : 'outline'}
                        onClick={() => setContentType('podcast')}
                        className={contentType === 'podcast' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                    >
                        <Mic className="w-4 h-4 mr-2" />
                        Podcast
                    </Button>
                </div>

                {/* Topic Input */}
                <div className="space-y-2">
                    <Label htmlFor="topic">Topic or Idea</Label>
                    <Textarea
                        id="topic"
                        placeholder="e.g., The future of artificial intelligence in healthcare..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        rows={3}
                    />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map((cat) => {
                                const catValue = typeof cat === 'string' ? cat : cat.value || cat.name || String(cat)
                                const catLabel = typeof cat === 'string' ? cat : cat.label || cat.name || String(cat)
                                return (
                                    <SelectItem key={catValue} value={catValue}>
                                        {catLabel.charAt(0).toUpperCase() + catLabel.slice(1)}
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {/* Tone Selection */}
                <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger id="tone">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="humorous">Humorous</SelectItem>
                            <SelectItem value="inspirational">Inspirational</SelectItem>
                            <SelectItem value="educational">Educational</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* YouTube URL for Videos */}
                {contentType === 'video' && (
                    <div className="space-y-2">
                        <Label htmlFor="youtubeUrl">YouTube URL (Optional)</Label>
                        <Input
                            id="youtubeUrl"
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Paste a YouTube video URL to link to actual content
                        </p>
                    </div>
                )}

                {/* Audio URL for Podcasts */}
                {contentType === 'podcast' && (
                    <div className="space-y-2">
                        <Label htmlFor="audioUrl">Audio URL (Optional)</Label>
                        <Input
                            id="audioUrl"
                            type="url"
                            placeholder="https://example.com/podcast.mp3"
                            value={audioUrl}
                            onChange={(e) => setAudioUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Paste an audio file URL or podcast link
                        </p>
                    </div>
                )}

                {/* Generate Button */}
                <Button
                    onClick={generateContent}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate {contentType === 'article' ? 'Article' : contentType === 'video' ? 'Video' : 'Podcast'}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

// Helper function to generate mock content
function generateMockContent(topic: string, type: MediaType, tone: string): string {
    const toneIntros = {
        professional: 'In today\'s rapidly evolving landscape,',
        casual: 'Hey there! Let\'s talk about',
        humorous: 'Buckle up, because we\'re diving into',
        inspirational: 'Imagine a world where',
        educational: 'Understanding the fundamentals of',
    }

    const intro = toneIntros[tone as keyof typeof toneIntros] || toneIntros.professional

    if (type === 'article') {
        return `${intro} ${topic} has become increasingly important. This comprehensive analysis explores the key aspects, implications, and future directions of this fascinating subject.

## Key Insights

The landscape of ${topic} is transforming at an unprecedented pace. Industry experts and thought leaders are converging on several critical points that deserve our attention.

## Deep Dive

When we examine ${topic} more closely, we discover layers of complexity that reveal both challenges and opportunities. The intersection of technology, human behavior, and societal needs creates a unique ecosystem worth exploring.

## Future Implications

Looking ahead, ${topic} will continue to shape our world in profound ways. The decisions we make today will echo through tomorrow's innovations and discoveries.

## Conclusion

As we navigate this exciting frontier, staying informed and engaged with ${topic} becomes not just beneficial, but essential for anyone looking to thrive in our rapidly changing world.`
    } else if (type === 'video') {
        return `🎥 Video Script: ${topic}

[Opening Scene]
${intro} ${topic}...

[Main Content]
In this video, we'll explore the fascinating world of ${topic}, breaking down complex concepts into digestible insights.

[Key Points]
• Understanding the fundamentals
• Real-world applications
• Future trends and predictions

[Closing]
Thanks for watching! Don't forget to like and subscribe for more content about ${topic}.`
    } else {
        return `🎙️ Podcast Episode: ${topic}

[Intro Music]

Host: Welcome back to another episode! Today we're discussing ${topic}.

[Discussion]
${intro} ${topic} represents a fascinating intersection of innovation and practical application. Let's break this down...

[Segment 1: Background]
To understand ${topic}, we need to look at where it came from and why it matters now.

[Segment 2: Current State]
Today, ${topic} is evolving rapidly, with new developments emerging constantly.

[Segment 3: Future Outlook]
Looking ahead, the potential of ${topic} is truly exciting.

[Outro]
That's all for today! Subscribe for more insights on ${topic} and related topics.`
    }
}
