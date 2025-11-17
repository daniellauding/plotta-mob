# 🚀 Quick Start - Fix Live Updates & AI

## The Issue You're Seeing

✅ **Good news:** The real-time code is already implemented!
❌ **Problem:** Supabase real-time needs to be enabled in your database

## Step 1: Enable Real-Time (2 minutes)

### Go to Supabase Dashboard

1. Visit: https://app.supabase.com/project/YOUR_PROJECT_ID/database/replication
2. Find the `supabase_realtime` publication
3. Enable these tables:
   - ✅ stickies
   - ✅ projects
   - ✅ tags

### OR Run This SQL

In your Supabase SQL Editor:

```sql
-- Run the ENABLE_REALTIME.sql file
-- Or paste this:

ALTER TABLE stickies REPLICA IDENTITY FULL;
ALTER TABLE projects REPLICA IDENTITY FULL;
ALTER TABLE tags REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE stickies;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tags;
```

## Step 2: Add Missing Database Columns (1 minute)

Run this SQL to add the position columns:

```sql
-- Run the MIGRATE_STICKIES_ADD_POSITION.sql file
```

This adds:
- `position_x`, `position_y` (for canvas positioning)
- `width`, `height` (for note sizing)
- `tags` (for tag support)
- `status` (for todo/in_progress/done)

## Step 3: Test Real-Time

After enabling real-time:

1. **Restart your app**
2. **Open a project**
3. **Check the console** - you should see:
   ```
   ✅ Successfully subscribed to real-time updates for project: <id>
   ```
4. **Create a note** - you should see:
   ```
   ✅ Note created successfully
   📡 Realtime update: INSERT <id>
   ➕ Adding new sticky to UI: <title>
   ```
5. **Note appears immediately!** 🎉

## Step 4: Test Checkboxes

1. Create a note with:
   ```
   - [ ] Task 1
   - [ ] Task 2
   ```
2. **Tap a checkbox** - it should toggle immediately
3. Console shows:
   ```
   📡 Realtime update: UPDATE <id>
   ✏️ Updating sticky: <title>
   ```

## AI Assistant Setup (Optional)

The AI Assistant needs an Edge Function. You have 2 options:

### Option A: Use Your Own API Key (Easiest)

1. Get an API key from:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/

2. In the app:
   - Tap magic wand icon (AI Assistant)
   - Tap settings (gear icon)
   - Enter your API key
   - Select provider (OpenAI or Anthropic)

3. Deploy the Edge Function (see `SETUP_AI_ASSISTANT.md`)

### Option B: Skip AI for Now

Just don't use the AI Assistant feature until you're ready to set it up.

## Troubleshooting

### Error: "mismatch between server and client bindings"

**This is your current error!** Run this SQL immediately:

```sql
-- Run FIX_REALTIME_MISMATCH.sql
-- Or paste this:

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

ALTER TABLE stickies REPLICA IDENTITY FULL;
ALTER TABLE projects REPLICA IDENTITY FULL;
ALTER TABLE tags REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE stickies;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tags;

-- Critical: Refresh the schema
NOTIFY pgrst, 'reload schema';
```

Then **restart your app completely** (kill and reopen).

### Still No Live Updates?

Check console for:
```
❌ Subscription error: ...
```

This means:
1. Real-time not enabled (do Step 1 again)
2. RLS policy blocking (check database policies)
3. Network issue (check internet)

### See Errors About "position_x"?

You didn't run the migration (Step 2). Run `MIGRATE_STICKIES_ADD_POSITION.sql`

### App Crashes After Creating Note?

The position values must be integers. This is fixed in the latest code.

## What I Changed

1. ✅ Enhanced logging in `useStickies` hook
2. ✅ Added duplicate check for INSERT events
3. ✅ Added subscription status callback
4. ✅ Fixed all position values to use `Math.round()`
5. ✅ Created comprehensive setup guides

## Expected Console Output (Success)

```
📡 Subscription status: CHANNEL_STATE_CHANGE
📡 Subscription status: SUBSCRIBED
✅ Successfully subscribed to real-time updates for project: abc-123

[You create a note]

✅ Note created successfully
📡 Realtime update: INSERT def-456
➕ Adding new sticky to UI: My Note
```

## Next Steps

1. **Enable real-time** (Step 1) - REQUIRED
2. **Run migration** (Step 2) - REQUIRED
3. **Test it** (Step 3)
4. **Set up AI** (Step 4) - OPTIONAL

That's it! Your live updates should work now. 🎉

## Files Created

- `ENABLE_REALTIME.sql` - Enable real-time in database
- `MIGRATE_STICKIES_ADD_POSITION.sql` - Add missing columns
- `SETUP_AI_ASSISTANT.md` - Detailed AI setup guide
- `REALTIME_SETUP_GUIDE.md` - Detailed real-time troubleshooting

---

**Questions?** Check the console logs and compare with the expected output above!
