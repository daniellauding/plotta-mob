-- Add missing position and dimension columns to stickies table
-- These are needed for the canvas positioning system

-- Add position columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stickies' AND column_name = 'position_x') THEN
    ALTER TABLE stickies ADD COLUMN position_x INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stickies' AND column_name = 'position_y') THEN
    ALTER TABLE stickies ADD COLUMN position_y INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stickies' AND column_name = 'width') THEN
    ALTER TABLE stickies ADD COLUMN width INTEGER NOT NULL DEFAULT 300;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stickies' AND column_name = 'height') THEN
    ALTER TABLE stickies ADD COLUMN height INTEGER NOT NULL DEFAULT 250;
  END IF;
END $$;

-- Add tags column if it doesn't exist (for tag support)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stickies' AND column_name = 'tags') THEN
    ALTER TABLE stickies ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Add theme_color, logo_url, background_url, visibility, access_password to projects if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'theme_color') THEN
    ALTER TABLE projects ADD COLUMN theme_color TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'logo_url') THEN
    ALTER TABLE projects ADD COLUMN logo_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'background_url') THEN
    ALTER TABLE projects ADD COLUMN background_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'visibility') THEN
    ALTER TABLE projects ADD COLUMN visibility TEXT DEFAULT 'private'
      CHECK (visibility IN ('private', 'invite_only', 'public'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'access_password') THEN
    ALTER TABLE projects ADD COLUMN access_password TEXT;
  END IF;
END $$;

-- Add status column to stickies if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stickies' AND column_name = 'status') THEN
    ALTER TABLE stickies ADD COLUMN status TEXT
      CHECK (status IN ('todo', 'in_progress', 'done'));
  END IF;
END $$;
