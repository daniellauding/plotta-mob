-- Migration: Add missing fields to stickies table and create supporting tables
-- Run this in your Supabase SQL Editor

-- 1. Add missing fields to stickies table
ALTER TABLE stickies
  ADD COLUMN IF NOT EXISTS z_index INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS group_id UUID;

-- 2. Create sticky_votes table for voting system
CREATE TABLE IF NOT EXISTS sticky_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sticky_id UUID NOT NULL REFERENCES stickies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sticky_id, user_id)
);

-- Create index for faster vote counting
CREATE INDEX IF NOT EXISTS idx_sticky_votes_sticky_id ON sticky_votes(sticky_id);
CREATE INDEX IF NOT EXISTS idx_sticky_votes_user_id ON sticky_votes(user_id);

-- Enable RLS on sticky_votes
ALTER TABLE sticky_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for sticky_votes
CREATE POLICY "Users can view all votes" ON sticky_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON sticky_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON sticky_votes
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Create sticky_comments table for comments system
CREATE TABLE IF NOT EXISTS sticky_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sticky_id UUID NOT NULL REFERENCES stickies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES sticky_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster comment queries
CREATE INDEX IF NOT EXISTS idx_sticky_comments_sticky_id ON sticky_comments(sticky_id);
CREATE INDEX IF NOT EXISTS idx_sticky_comments_parent_id ON sticky_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_sticky_comments_user_id ON sticky_comments(user_id);

-- Enable RLS on sticky_comments
ALTER TABLE sticky_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for sticky_comments
CREATE POLICY "Users can view comments on stickies they can access" ON sticky_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stickies s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = sticky_comments.sticky_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert comments on stickies they can access" ON sticky_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM stickies s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = sticky_comments.sticky_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
        )
      )
    )
  );

CREATE POLICY "Users can update their own comments" ON sticky_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON sticky_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#000000',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, project_id)
);

-- Create index for tags
CREATE INDEX IF NOT EXISTS idx_tags_project_id ON tags(project_id);

-- Enable RLS on tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for tags
CREATE POLICY "Users can view tags for projects they can access" ON tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tags.project_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Project editors can manage tags" ON tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tags.project_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
        )
      )
    )
  );

-- 5. Create sticky_tags junction table
CREATE TABLE IF NOT EXISTS sticky_tags (
  sticky_id UUID NOT NULL REFERENCES stickies(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (sticky_id, tag_id)
);

-- Create indexes for sticky_tags
CREATE INDEX IF NOT EXISTS idx_sticky_tags_sticky_id ON sticky_tags(sticky_id);
CREATE INDEX IF NOT EXISTS idx_sticky_tags_tag_id ON sticky_tags(tag_id);

-- Enable RLS on sticky_tags
ALTER TABLE sticky_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for sticky_tags
CREATE POLICY "Users can view sticky_tags for stickies they can access" ON sticky_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stickies s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = sticky_tags.sticky_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Project editors can manage sticky_tags" ON sticky_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stickies s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = sticky_tags.sticky_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
        )
      )
    )
  );

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to sticky_comments
DROP TRIGGER IF EXISTS update_sticky_comments_updated_at ON sticky_comments;
CREATE TRIGGER update_sticky_comments_updated_at
  BEFORE UPDATE ON sticky_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Create helpful views for vote counts
CREATE OR REPLACE VIEW sticky_vote_counts AS
SELECT
  sticky_id,
  COUNT(*) as vote_count
FROM sticky_votes
GROUP BY sticky_id;

-- 8. Create helpful views for comment counts
CREATE OR REPLACE VIEW sticky_comment_counts AS
SELECT
  sticky_id,
  COUNT(*) as comment_count
FROM sticky_comments
GROUP BY sticky_id;

-- Grant access to views
GRANT SELECT ON sticky_vote_counts TO authenticated;
GRANT SELECT ON sticky_comment_counts TO authenticated;

-- Done!
-- Now your mobile app can use:
-- - Voting (sticky_votes table)
-- - Comments (sticky_comments table)
-- - Tags (tags and sticky_tags tables)
-- - Lock/Pin/Hide (new boolean fields on stickies)
-- - Grouping (group_id field on stickies)
-- - Z-index for layering (z_index field on stickies)
