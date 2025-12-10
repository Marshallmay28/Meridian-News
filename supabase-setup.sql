-- ============================================
-- SUPABASE AUTH - UPDATED RLS POLICIES
-- Run this AFTER migrating to Supabase Auth
-- ============================================

-- ============================================
-- PART 1: DROP OLD POLICIES
-- ============================================

DROP POLICY IF EXISTS "Allow public read access" ON content;
DROP POLICY IF EXISTS "Allow authenticated insert" ON content;
DROP POLICY IF EXISTS "Allow users to update own content" ON content;
DROP POLICY IF EXISTS "Allow authenticated update" ON content;
DROP POLICY IF EXISTS "Allow admin delete" ON content;
DROP POLICY IF EXISTS "Allow users to delete own content" ON content;
DROP POLICY IF EXISTS "Allow authenticated delete" ON content;

-- ============================================
-- PART 2: ENABLE RLS
-- ============================================

ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 3: NEW POLICIES WITH NATIVE AUTH
-- ============================================

-- Policy 1: Allow anyone to read content
CREATE POLICY "Allow public read access"
ON content
FOR SELECT
TO public
USING (true);

-- Policy 2: Allow authenticated users to insert content
CREATE POLICY "Allow authenticated insert"
ON content
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Allow users to update their own content
-- NOW WORKS: Uses auth.uid() from Supabase Auth
CREATE POLICY "Allow users to update own content"
ON content
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

-- Policy 4: Allow admins to delete any content
-- NOW WORKS: Checks user_metadata for admin role
CREATE POLICY "Allow admin delete"
ON content
FOR DELETE
TO authenticated
USING (
  (SELECT raw_user_meta_data->>'role' 
   FROM auth.users 
   WHERE id = auth.uid()) = 'admin'
);

-- Policy 5: Allow users to delete their own content
CREATE POLICY "Allow users to delete own content"
ON content
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- ============================================
-- PART 4: PERFORMANCE OPTIMIZATIONS
-- ============================================

-- Add slug column for SEO-friendly URLs
ALTER TABLE content ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create indexes
CREATE INDEX IF NOT EXISTS content_slug_idx ON content(slug);
CREATE INDEX IF NOT EXISTS content_media_type_idx ON content(media_type);
CREATE INDEX IF NOT EXISTS content_category_idx ON content(category);
CREATE INDEX IF NOT EXISTS content_published_at_idx ON content(published_at DESC);
CREATE INDEX IF NOT EXISTS content_is_ai_idx ON content(is_ai);
CREATE INDEX IF NOT EXISTS content_category_media_idx ON content(category, media_type);

-- ============================================
-- PART 5: STORAGE BUCKETS
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('content-videos', 'content-videos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('content-audio', 'content-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('content-images', 'content-videos', 'content-audio'));

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('content-images', 'content-videos', 'content-audio'));

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('content-images', 'content-videos', 'content-audio'));

-- ============================================
-- PART 6: SLUG GENERATION
-- ============================================

-- Function to generate slug
CREATE OR REPLACE FUNCTION generate_slug(headline TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  base_slug := lower(regexp_replace(headline, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM content WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-slug generation
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.headline);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_slug_trigger ON content;
CREATE TRIGGER content_slug_trigger
  BEFORE INSERT ON content
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- ============================================
-- NOTES
-- ============================================

/*
✅ KEY CHANGES FROM PREVIOUS VERSION:

1. ✅ NOW USES auth.uid()
   - Works with Supabase Auth
   - No more workarounds

2. ✅ ADMIN CHECK WORKS
   - Reads from auth.users table
   - Checks user_metadata->>'role'

3. ✅ PROPER USER OWNERSHIP
   - Users can update/delete own content
   - Admins can delete any content

📝 TO SET ADMIN ROLE:
1. Go to Supabase Dashboard
2. Authentication → Users
3. Click on user
4. Edit User Metadata:
   {
     "role": "admin",
     "name": "Admin Name"
   }

🧪 TO TEST:
1. Register a new user
2. Login
3. Try creating content
4. Try deleting content (should fail unless admin)
5. Set role to admin
6. Try deleting again (should work)
*/
