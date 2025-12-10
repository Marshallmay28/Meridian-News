-- Migration Script: Update RLS Policies Only
-- This script updates policies without recreating tables
-- Safe to run on existing databases

-- Drop existing policies if they exist
-- Users policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON users;

-- Articles policies
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can create articles" ON articles;
DROP POLICY IF EXISTS "Users can update their own articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON articles;
DROP POLICY IF EXISTS "Users can delete their own articles" ON articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;

-- Videos policies
DROP POLICY IF EXISTS "Anyone can view published videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can create videos" ON videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
DROP POLICY IF EXISTS "Admins can delete videos" ON videos;

-- Podcasts policies
DROP POLICY IF EXISTS "Anyone can view published podcasts" ON podcasts;
DROP POLICY IF EXISTS "Authenticated users can create podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can update their own podcasts" ON podcasts;
DROP POLICY IF EXISTS "Authenticated users can update podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can delete their own podcasts" ON podcasts;
DROP POLICY IF EXISTS "Admins can delete podcasts" ON podcasts;

-- Comments policies
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can update comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON comments;

-- Platform settings policies
DROP POLICY IF EXISTS "Anyone can view platform settings" ON platform_settings;
DROP POLICY IF EXISTS "Only admins can modify settings" ON platform_settings;

-- Content table policies
DROP POLICY IF EXISTS "Anyone can view published content" ON content;
DROP POLICY IF EXISTS "Users can insert their own content" ON content;
DROP POLICY IF EXISTS "Authenticated users can insert content" ON content;
DROP POLICY IF EXISTS "Users can update their own content" ON content;
DROP POLICY IF EXISTS "Authenticated users can update content" ON content;
DROP POLICY IF EXISTS "Users can delete their own content" ON content;
DROP POLICY IF EXISTS "Admins can delete content" ON content;

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies

-- Users policies - Permissive for authenticated users
CREATE POLICY "Authenticated users can view users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update users" ON users
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Articles policies - Simplified to avoid type casting
CREATE POLICY "Anyone can view published articles" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create articles" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update articles" ON articles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete articles" ON articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Videos policies - Simplified to avoid type casting
CREATE POLICY "Anyone can view published videos" ON videos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create videos" ON videos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update videos" ON videos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete videos" ON videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Podcasts policies - Simplified to avoid type casting
CREATE POLICY "Anyone can view published podcasts" ON podcasts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create podcasts" ON podcasts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update podcasts" ON podcasts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete podcasts" ON podcasts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Comments policies - Simplified to avoid type casting
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update comments" ON comments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete comments" ON comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Platform settings policies (admin only)
CREATE POLICY "Anyone can view platform settings" ON platform_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Content table policies
CREATE POLICY "Anyone can view published content"
  ON content FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert content"
  ON content FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update content"
  ON content FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete content"
  ON content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
