-- Enable real-time for stickies table
-- Run this in your Supabase SQL Editor to enable live updates

-- 1. Enable real-time on the stickies table
ALTER TABLE stickies REPLICA IDENTITY FULL;

-- 2. Enable real-time on the projects table (for project settings updates)
ALTER TABLE projects REPLICA IDENTITY FULL;

-- 3. Enable real-time on the tags table (for tag updates)
ALTER TABLE tags REPLICA IDENTITY FULL;

-- 4. Verify real-time is enabled
-- You can check in Supabase Dashboard > Database > Replication
-- Make sure the publication 'supabase_realtime' includes these tables

-- If you need to manually add tables to the publication:
-- ALTER PUBLICATION supabase_realtime ADD TABLE stickies;
-- ALTER PUBLICATION supabase_realtime ADD TABLE projects;
-- ALTER PUBLICATION supabase_realtime ADD TABLE tags;
