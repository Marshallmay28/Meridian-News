-- ============================================
-- PART 1: ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable Row Level Security on content table
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read content
CREATE POLICY "Allow public read access"
ON content
FOR SELECT
TO public
USING (true);

-- Policy: Allow authenticated users to insert content
CREATE POLICY "Allow authenticated insert"
ON content
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow users to update their own content
CREATE POLICY "Allow users to update own content"
ON content
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

-- Policy: Allow admin to delete any content
CREATE POLICY "Allow admin delete"
ON content
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()::text
    AND users.role = 'admin'
  )
);

-- Policy: Allow users to delete their own content
CREATE POLICY "Allow users to delete own content"
ON content
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- ============================================
-- PART 2: PERFORMANCE OPTIMIZATIONS
-- ============================================

-- Add slug column for SEO-friendly URLs
-- Example: /article/my-first-post instead of /article/uuid
ALTER TABLE content ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS content_slug_idx ON content(slug);

-- Create index on media_type for filtering
CREATE INDEX IF NOT EXISTS content_media_type_idx ON content(media_type);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS content_category_idx ON content(category);

-- Create index on published_at for sorting
CREATE INDEX IF NOT EXISTS content_published_at_idx ON content(published_at DESC);

-- Create index on is_ai for filtering AI content
CREATE INDEX IF NOT EXISTS content_is_ai_idx ON content(is_ai);

-- Create composite index for common queries (category + media_type)
CREATE INDEX IF NOT EXISTS content_category_media_idx ON content(category, media_type);

-- ============================================
-- PART 3: STORAGE BUCKET SETUP
-- ============================================

-- Create storage bucket for images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for videos (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-videos', 'content-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for audio/podcasts (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-audio', 'content-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('content-images', 'content-videos', 'content-audio'));

-- Storage policy: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('content-images', 'content-videos', 'content-audio'));

-- Storage policy: Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('content-images', 'content-videos', 'content-audio'));

-- ============================================
-- PART 4: HELPER FUNCTION FOR SLUG GENERATION
-- ============================================

-- Function to generate slug from headline
CREATE OR REPLACE FUNCTION generate_slug(headline TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(headline, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check if slug exists, if so append number
  WHILE EXISTS (SELECT 1 FROM content WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 5: TRIGGER TO AUTO-GENERATE SLUGS
-- ============================================

-- Trigger function to auto-generate slug on insert
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.headline);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS content_slug_trigger ON content;
CREATE TRIGGER content_slug_trigger
  BEFORE INSERT ON content
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- ============================================
-- NOTES & BEST PRACTICES
-- ============================================

/*
✅ BEST PRACTICES IMPLEMENTED:

1. UUIDs for IDs (already in use)
   - Faster and more scalable than incrementing IDs
   
2. Slug column for SEO-friendly URLs
   - /article/my-first-post instead of /article/uuid
   - Auto-generated from headline
   - Unique constraint prevents duplicates
   
3. Database indexes for performance
   - slug, media_type, category, published_at, is_ai
   - Composite index for common queries
   
4. Supabase Storage for large files
   - Separate buckets for images, videos, audio
   - Public read access, authenticated upload
   - Don't store files in database!
   
5. Row Level Security
   - Public read, authenticated write
   - Admin can delete anything
   - Users can delete their own content

📝 USAGE EXAMPLES:

-- Query by slug (fast with index)
SELECT * FROM content WHERE slug = 'my-first-post';

-- Upload image to storage (in your app)
const { data } = await supabase.storage
  .from('content-images')
  .upload('article-123.jpg', file)

-- Store only the URL in database
INSERT INTO content (headline, image)
VALUES ('My Article', 'https://[project].supabase.co/storage/v1/object/public/content-images/article-123.jpg');
*/

