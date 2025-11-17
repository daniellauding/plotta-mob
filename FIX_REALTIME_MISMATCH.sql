-- Fix: "mismatch between server and client bindings for postgres changes"
-- This error happens when the real-time schema doesn't match the table

-- Step 1: Drop and recreate the publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- Step 2: Set REPLICA IDENTITY to FULL (includes all columns)
ALTER TABLE stickies REPLICA IDENTITY FULL;
ALTER TABLE projects REPLICA IDENTITY FULL;
ALTER TABLE tags REPLICA IDENTITY FULL;
ALTER TABLE sticky_comments REPLICA IDENTITY FULL;
ALTER TABLE sticky_votes REPLICA IDENTITY FULL;

-- Step 3: Add tables to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE stickies;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tags;
ALTER PUBLICATION supabase_realtime ADD TABLE sticky_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE sticky_votes;

-- Step 4: Refresh the schema cache (VERY IMPORTANT!)
NOTIFY pgrst, 'reload schema';

-- Step 5: Verify the setup
SELECT
  schemaname,
  tablename,
  pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- You should see all your tables listed above

-- Alternative: If the above doesn't work, try this more aggressive approach:
--
-- 1. Go to Supabase Dashboard > Database > Replication
-- 2. Remove all tables from supabase_realtime publication
-- 3. Add them back one by one
-- 4. Restart your Supabase project (if on free plan, this restarts automatically)

-- Notes:
-- - REPLICA IDENTITY FULL means all column changes are sent
-- - Without this, only primary key changes trigger updates
-- - The schema cache refresh is critical - restart the app after running this
