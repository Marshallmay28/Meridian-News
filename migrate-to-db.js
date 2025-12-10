// Migration script to move localStorage content to Supabase
// Run this in browser console on http://localhost:3002

async function migrateToDatabase() {
    console.log('🚀 Starting migration...')

    // Get all content from localStorage
    const articles = JSON.parse(localStorage.getItem('meridianArticles') || '[]')
    const videos = JSON.parse(localStorage.getItem('meridianVideos') || '[]')
    const podcasts = JSON.parse(localStorage.getItem('meridianPodcasts') || '[]')

    const allContent = [...articles, ...videos, ...podcasts]
    console.log(`📦 Found ${allContent.length} items in localStorage`)

    let successCount = 0
    let errorCount = 0

    for (const item of allContent) {
        try {
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            })

            if (response.ok) {
                successCount++
                console.log(`✅ Migrated: ${item.headline}`)
            } else {
                errorCount++
                const error = await response.text()
                console.error(`❌ Failed: ${item.headline}`, error)
            }
        } catch (error) {
            errorCount++
            console.error(`❌ Error migrating: ${item.headline}`, error)
        }
    }

    console.log(`\n✨ Migration complete!`)
    console.log(`✅ Success: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`\n🔄 Refresh the page to see database content!`)
}

// Run migration
migrateToDatabase()
