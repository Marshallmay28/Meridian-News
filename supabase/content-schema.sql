-- Meridian Post Content Table
-- Stores all published articles, videos, and podcasts

CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Common fields
  headline TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('article', 'video', 'podcast')),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  read_time INTEGER,
  is_ai BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  
  -- Article specific
  image TEXT,
  
  -- Video specific
  video_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  resolution TEXT,
  file_size TEXT,
  
  -- Podcast specific
  audio_url TEXT,
  cover_image_url TEXT,
  episode_number INTEGER,
  season_number INTEGER,
  transcript TEXT,
  
  -- Additional fields
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_media_type ON content(media_type);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON content(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_user_id ON content(user_id);
CREATE INDEX IF NOT EXISTS idx_content_is_ai ON content(is_ai);

-- Enable Row Level Security
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published content
CREATE POLICY "Anyone can view published content"
  ON content FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own content
CREATE POLICY "Users can insert their own content"
  ON content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own content
CREATE POLICY "Users can update their own content"
  ON content FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own content
CREATE POLICY "Users can delete their own content"
  ON content FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
