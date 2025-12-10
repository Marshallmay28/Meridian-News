-- Fix RLS policies for content table to properly check authentication
-- This replaces the simplified policies with ones that actually work with Supabase Auth

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view published content" ON content;
DROP POLICY IF EXISTS "Authenticated users can insert content" ON content;
DROP POLICY IF EXISTS "Authenticated users can update content" ON content;
DROP POLICY IF EXISTS "Admins can delete content" ON content;

-- Policy: Anyone can read published content
CREATE POLICY "Anyone can view published content"
  ON content FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert content
-- Check if auth.uid() is not null (user is logged in)
CREATE POLICY "Authenticated users can insert content"
  ON content FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can update their own content
CREATE POLICY "Authenticated users can update content"
  ON content FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Policy: Admins can delete any content
CREATE POLICY "Admins can delete content"
  ON content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
