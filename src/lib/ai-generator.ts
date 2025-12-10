// AI Article Generation System for Meridian Post
// Generates high-quality, human-like articles automatically

export interface AIArticle {
  id: string
  headline: string
  content: string
  summary: string
  author: string
  category: string
  image: string
  publishedAt: string
  views: number
  likes: number
  comments: Array<{ user: string, text: string, date: string }>
  readTime: number
  tags: string[]
  isAI: boolean
  aiSignature: string
  factCheckStatus: string
  sources: string[]
  aiModel: string
  confidence: number
}

export interface AIConfig {
  dailyGenerationCount: number
  lastGeneration: string
  nextGeneration: string
  topicsCovered: string[]
  generationHistory: Array<{ timestamp: string, category: string, count: number }>
  userPreferences: {
    preferredCategories: string[]
    aiContentEnabled: boolean
    aiDensity: 'minimal' | 'balanced' | 'frequent'
  }
}

export class AIArticleGenerator {
  private topics: Record<string, string[]> = {
    breaking: [
      "Major Earthquake Strikes Pacific Region",
      "Stock Market Experiences Historic Rally",
      "New Tech Startup Reaches $1B Valuation",
      "Global Climate Summit Reaches Landmark Agreement",
      "Revolutionary Medical Breakthrough Announced"
    ],
    politics: [
      "Election Polls Show Surprising Shift",
      "New Legislation Proposed on Climate Change",
      "International Summit Yields Historic Agreement",
      "Congressional Committee Launches Investigation",
      "Presidential Approval Rating Hits New High"
    ],
    technology: [
      "AI System Achieves Human-Level Reasoning",
      "Quantum Computing Milestone Reached",
      "New Social Media Platform Goes Viral",
      "Breakthrough in Battery Technology",
      "Scientists Announce Computing Revolution"
    ],
    business: [
      "Fortune 500 Company Reports Record Profits",
      "Global Supply Chain Disruption Affects Markets",
      "New Trade Deal Signed Between Major Economies",
      "Startup Ecosystem Booms in Silicon Valley",
      "Cryptocurrency Reaches All-Time High"
    ],
    sports: [
      "Underdog Team Wins Championship",
      "Star Player Signs Record-Breaking Contract",
      "Olympic Committee Announces New Sports",
      "World Record Broken in Swimming Finals",
      "Legendary Coach Announces Retirement"
    ],
    entertainment: [
      "Blockbuster Movie Breaks Box Office Records",
      "Streaming Service Announces Original Content",
      "Celebrity Couple Announces Engagement",
      "Music Festival Lineup Goes Viral",
      "TV Series Gets Renewed for Multiple Seasons"
    ],
    health: [
      "New Treatment Shows Promise for Disease",
      "Global Health Organization Issues Guidelines",
      "Study Reveals Surprising Health Benefits",
      "Medical Researchers Make Discovery",
      "Public Health Campaign Shows Success"
    ],
    science: [
      "Space Telescope Finds Earth-Like Planet",
      "Archaeologists Discover Ancient Civilization",
      "Physics Experiment Challenges Established Theory",
      "Marine Biologists Find New Species",
      "Climate Study Reveals Urgent Timeline"
    ],
    world: [
      "UN Security Council Holds Emergency Meeting",
      "International Aid Reaches Disaster Zone",
      "Diplomatic Breakthrough in Regional Conflict",
      "Global Trade Agreement Signed",
      "Refugee Crisis Reaches Critical Point"
    ]
  }

  private templates = {
    news: (event: string, location: string, source: string, consequence: string) =>
      `In a significant development that has captured global attention, ${event} has occurred in ${location}. According to ${source}, this could lead to ${consequence}. The situation is still developing, and officials are urging the public to stay informed through official channels.`,

    feature: (topic: string, insight: string, solution: string, counterpoint: string) =>
      `Deep dive into ${topic} reveals ${insight}. Experts suggest ${solution} while critics argue ${counterpoint}. The debate highlights the complexity of the issue and the need for balanced approaches to address the challenges ahead.`,

    opinion: (position: string, issue: string, evidence: string, opposition: string) =>
      `Why ${position} is the right approach to ${issue}. The evidence shows ${evidence} despite ${opposition}. As we navigate these complex times, it's crucial to consider all perspectives and make informed decisions based on facts and careful analysis.`,

    analysis: (subject: string, data: string, implications: string, future: string) =>
      `Analysis of ${subject} reveals important patterns based on ${data}. The implications suggest ${implications} which could reshape our understanding of ${future}. Experts are closely monitoring these developments as they unfold.`
  }

  private locations = [
    "New York", "London", "Tokyo", "Singapore", "Berlin",
    "Sydney", "Paris", "Toronto", "Dubai", "San Francisco",
    "Hong Kong", "Mumbai", "São Paulo", "Cairo", "Mexico City"
  ]

  private institutions = [
    "International Policy Institute", "Global Economic Forum",
    "Center for Technological Advancement", "United Nations Research Division",
    "World Health Organization", "International Energy Agency",
    "Global Climate Research Center", "Space Exploration Institute"
  ]

  private experts = [
    "Dr. Sarah Chen", "Professor James Wilson", "Analyst Maria Rodriguez",
    "Expert David Kim", "Researcher Emma Thompson", "Specialist Michael Brown",
    "Consultant Lisa Anderson", "Scientist Robert Taylor", "Advisor Jennifer White"
  ]

  generateArticle(category: string = 'random', template: string = 'news'): AIArticle {
    const categories = Object.keys(this.topics)
    const selectedCategory = category === 'random' ?
      categories[Math.floor(Math.random() * categories.length)] : category

    const topicList = this.topics[selectedCategory] || this.topics.world
    const selectedTopic = topicList[Math.floor(Math.random() * topicList.length)]

    const headline = this.generateHeadline(selectedTopic, selectedCategory)
    const content = this.generateContent(headline, selectedCategory, template)

    return {
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      headline: headline,
      content: content,
      summary: this.generateSummary(headline, selectedCategory),
      author: this.getRandomAuthor(),
      category: selectedCategory,
      image: this.getRandomImage(selectedCategory),
      publishedAt: new Date().toISOString(),
      views: Math.floor(Math.random() * 10000) + 500,
      likes: Math.floor(Math.random() * 800) + 20,
      comments: this.generateRandomComments(),
      readTime: Math.floor(Math.random() * 8) + 3,
      tags: this.generateTags(selectedCategory),
      isAI: true,
      aiSignature: "Generated by Meridian AI News Network v3.0",
      factCheckStatus: "AI-Generated Content - For Demonstration",
      sources: this.generateFakeSources(),
      aiModel: "NewsWriter-3.0",
      confidence: 0.85 + Math.random() * 0.14
    }
  }

  generateMultipleArticles(count: number = 5): AIArticle[] {
    const articles: AIArticle[] = []
    const categories = Object.keys(this.topics)

    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      articles.push(this.generateArticle(category))
    }

    return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }

  generateBreakingNews(): AIArticle {
    const breakingTopics = [
      "Stock Market Crash", "Natural Disaster", "Political Crisis",
      "Tech Breakthrough", "Sports Championship", "Health Emergency"
    ]

    const topic = breakingTopics[Math.floor(Math.random() * breakingTopics.length)]
    const location = this.getRandomLocation()
    const severity = ["MINOR", "MODERATE", "MAJOR"][Math.floor(Math.random() * 3)]

    return {
      id: `ai-breaking-${Date.now()}`,
      headline: `🚨 BREAKING: ${topic} in ${location}`,
      content: `Emergency services are responding to reports of ${topic.toLowerCase()} in ${location}. According to initial reports, the situation is ${severity.toLowerCase()} and authorities are taking immediate action. Residents are advised to stay tuned for official updates and follow safety guidelines provided by local officials. More information will be provided as the situation develops.`,
      summary: `Urgent reports of ${topic.toLowerCase()} in ${location}`,
      author: "Meridian AI Breaking News",
      category: "breaking",
      image: `https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1200&q=80`,
      publishedAt: new Date().toISOString(),
      views: Math.floor(Math.random() * 50000) + 10000,
      likes: Math.floor(Math.random() * 2000) + 500,
      comments: this.generateUrgentComments(),
      readTime: 2,
      tags: ["breaking", "urgent", "news"],
      isAI: true,
      aiSignature: "AI Breaking News Generator",
      factCheckStatus: "AI-Generated Breaking News",
      sources: ["Emergency Services", "Local Authorities", "AI News Network"],
      aiModel: "BreakingNews-1.0",
      confidence: 0.92
    }
  }

  private generateHeadline(topic: string, category: string): string {
    const headlineVariations = [
      `${topic}`,
      `Major Development: ${topic}`,
      `Breaking: ${topic}`,
      `Exclusive: ${topic}`,
      `${topic} - Experts Weigh In`,
      `${topic} Shakes Up ${category.charAt(0).toUpperCase() + category.slice(1)}`
    ]

    return headlineVariations[Math.floor(Math.random() * headlineVariations.length)]
  }

  private generateContent(headline: string, category: string, template: string): string {
    const location = this.getRandomLocation()
    const institution = this.getRandomInstitution()
    const expert = this.getRandomExpert()

    const paragraphs = [
      `# ${headline}`,
      ``,
      `In a significant development that has captured global attention, ${location} has become the focal point of today's breaking news. The implications of this event could be far-reaching, affecting millions of people across various sectors.`,
      ``,
      `## Expert Analysis`,
      `Experts from the ${institution} have released findings indicating a major shift in ${category} dynamics. "This represents a fundamental change in how we understand these issues," stated lead researcher ${expert}. "The data we've collected over the past months suggests we're at a critical juncture."`,
      ``,
      `## Key Factors at Play`,
      `Several critical elements are contributing to this development:`,
      `1. **Economic Impact**: Market analysts project significant effects on global trade and investment patterns.`,
      `2. **Social Consequences**: Communities are preparing for immediate and long-term changes to daily life.`,
      `3. **Political Ramifications**: Government officials are calling emergency sessions to address policy implications.`,
      `4. **Technological Implications**: The tech sector is already responding with innovative solutions.`,
      ``,
      `## What Comes Next`,
      `As the situation continues to evolve, stakeholders are preparing for multiple scenarios. The coming weeks will be crucial in determining long-term effects. International cooperation and coordinated responses will be essential in navigating these challenges successfully.`,
      ``,
      `## Expert Perspectives`,
      `Industry leaders and academic experts are divided on the optimal path forward. While some advocate for immediate action, others caution against hasty decisions. "We need to balance urgency with careful consideration," noted policy advisor ${expert}. "The choices we make today will echo for generations."`,
      ``,
      `*This AI-generated article is based on simulated data and is intended for demonstration and educational purposes only. Real news should be verified through official sources.*`
    ]

    return paragraphs.join('\n\n')
  }

  private generateSummary(headline: string, category: string): string {
    const summaries = [
      `${headline} - A comprehensive look at the latest developments in ${category}.`,
      `Breaking coverage of ${headline} with expert analysis and implications.`,
      `In-depth reporting on ${headline} and its impact on global affairs.`,
      `${headline}: Complete coverage with expert insights and future outlook.`
    ]

    return summaries[Math.floor(Math.random() * summaries.length)]
  }

  private generateRandomComments(): Array<{ user: string, text: string, date: string }> {
    const commentTemplates = [
      { user: "NewsReader123", text: "Fascinating analysis! Thanks for the comprehensive coverage.", date: "2 hours ago" },
      { user: "GlobalCitizen", text: "This is exactly why I follow quality journalism. Well done.", date: "3 hours ago" },
      { user: "TechEnthusiast", text: "Looking forward to updates on this developing story.", date: "4 hours ago" },
      { user: "PolicyWatcher", text: "The expert insights here are particularly valuable. Great context.", date: "5 hours ago" },
      { user: "InformedReader", text: "This changes everything. Need to share this with my network.", date: "6 hours ago" }
    ]

    const count = Math.floor(Math.random() * 4) + 1
    return commentTemplates.slice(0, count)
  }

  private generateUrgentComments(): Array<{ user: string, text: string, date: string }> {
    const urgentComments = [
      { user: "BreakingNewsFan", text: "First! This is huge news!", date: "1 minute ago" },
      { user: "UrgentUpdates", text: "Everyone please stay safe. Following official channels.", date: "2 minutes ago" },
      { user: "NewsJunkie", text: "Can't believe this is happening. More details needed ASAP.", date: "5 minutes ago" },
      { user: "SafetyFirst", text: "Hope everyone in the affected area is okay.", date: "8 minutes ago" }
    ]

    return urgentComments.slice(0, Math.floor(Math.random() * 3) + 1)
  }

  private generateTags(category: string): string[] {
    const tagSets: Record<string, string[]> = {
      world: ["international", "global", "diplomacy", "united-nations", "foreign-policy"],
      politics: ["election", "government", "policy", "congress", "democracy"],
      technology: ["innovation", "ai", "startup", "research", "digital"],
      business: ["economy", "markets", "finance", "investment", "trade"],
      sports: ["championship", "athlete", "competition", "fitness", "team"],
      entertainment: ["movies", "music", "celebrity", "culture", "arts"],
      health: ["medical", "wellness", "research", "treatment", "public-health"],
      science: ["research", "discovery", "space", "climate", "physics"],
      breaking: ["urgent", "emergency", "developing", "alert", "critical"]
    }

    return tagSets[category] || tagSets.world
  }

  private generateFakeSources(): string[] {
    const sources = [
      "International Press Association", "Global News Network", "World Reporters Guild",
      "Associated Press International", "Reuters Global", "Bloomberg News",
      "Financial Times Global", "CNN International", "BBC World Service",
      "Al Jazeera English", "The Guardian Global"
    ]

    const count = Math.floor(Math.random() * 3) + 2
    return sources.slice(0, count)
  }

  private getRandomLocation(): string {
    return this.locations[Math.floor(Math.random() * this.locations.length)]
  }

  private getRandomInstitution(): string {
    return this.institutions[Math.floor(Math.random() * this.institutions.length)]
  }

  private getRandomExpert(): string {
    return this.experts[Math.floor(Math.random() * this.experts.length)]
  }

  private getRandomAuthor(): string {
    const authors = [
      "Meridian AI Reporter", "AI News Network", "Digital Journalism AI",
      "Automated News Service", "Virtual News Desk", "AI Content Generator",
      "Meridian Post AI", "News Writing AI", "Digital Reporter"
    ]

    return authors[Math.floor(Math.random() * authors.length)]
  }

  private getRandomImage(category: string): string {
    const imageMap: Record<string, string> = {
      world: "https://images.unsplash.com/photo-15267792576-99f1229b5317",
      politics: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      technology: "https://images.unsplash.com/photo-1518709268805-4e9042af2176",
      business: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
      entertainment: "https://images.unsplash.com/photo-1489599807961-c7969cb83415",
      health: "https://images.unsplash.com/photo-1536049799445-3483e47f9c6e",
      science: "https://images.unsplash.com/photo-15320943498840-543bc11b2342",
      breaking: "https://images.unsplash.com/photo-1586953208448-b95a79798f07"
    }

    const baseImage = imageMap[category] || imageMap.world
    return `${baseImage}?auto=format&fit=crop&w=1200&q=80`
  }
  private videoIds: Record<string, string[]> = {
    world: ["HSv0k_BfXG0", "MQEkFppWaRI"], // NASA ISS Tours
    science: ["HSv0k_BfXG0", "MQEkFppWaRI"],
    technology: ["HSv0k_BfXG0", "aqz-KE-bpKQ"], // NASA or Big Buck Bunny (Open Movie)
    nature: ["xT0tWq1K_X0", "7h1L5-oV8sM"], // Relaxing Nature
    health: ["xT0tWq1K_X0"], // Relaxing Nature/Health
    entertainment: ["aqz-KE-bpKQ"], // Big Buck Bunny
    breaking: ["HSv0k_BfXG0"],
    politics: ["MQEkFppWaRI"], // Generic fallback
    business: ["MQEkFppWaRI"], // Generic fallback
    sports: ["aqz-KE-bpKQ"] // Generic fallback
  }

  generateVideoContent(category: string = 'random'): { headline: string, content: string, videoUrl: string, thumbnailUrl: string } {
    const article = this.generateArticle(category)
    const categories = Object.keys(this.videoIds)
    const selectedCategory = category === 'random' || !this.videoIds[category] ?
      categories[Math.floor(Math.random() * categories.length)] : category

    const videos = this.videoIds[selectedCategory] || this.videoIds.world
    const videoId = videos[Math.floor(Math.random() * videos.length)]

    return {
      headline: article.headline,
      content: article.content,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
  }
}

// Singleton instance for the app
export const aiGenerator = new AIArticleGenerator()