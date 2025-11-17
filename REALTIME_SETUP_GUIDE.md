# Real-Time Updates Setup Guide

## Issue: Notes Don't Appear Automatically

If your notes don't appear immediately after creation, follow these steps:

## Step 1: Enable Real-Time in Supabase

### Via Supabase Dashboard:

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Database** → **Replication**
3. Find the `supabase_realtime` publication
4. Make sure these tables are enabled:
   - ✅ `stickies`
   - ✅ `projects`
   - ✅ `tags`

### Via SQL (Run in SQL Editor):

```sql
-- Run the ENABLE_REALTIME.sql file we created
-- Or run this directly:

ALTER TABLE stickies REPLICA IDENTITY FULL;
ALTER TABLE projects REPLICA IDENTITY FULL;
ALTER TABLE tags REPLICA IDENTITY FULL;

-- Verify the publication includes our tables
ALTER PUBLICATION supabase_realtime ADD TABLE stickies;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tags;
```

## Step 2: Check Your Logs

After creating a note, check the console for these messages:

### ✅ What you SHOULD see:

```
✅ Note created successfully
📡 Subscription status: SUBSCRIBED
✅ Successfully subscribed to real-time updates for project: <project-id>
📡 Realtime update: INSERT <sticky-id>
➕ Adding new sticky to UI: <note-title>
```

### ❌ What indicates a problem:

```
❌ Subscription error: ...
📡 Subscription status: CLOSED
```

If you see errors, check:
1. **Real-time is enabled** in Supabase (see Step 1)
2. **Row Level Security (RLS)** policies allow SELECT on stickies

## Step 3: Verify RLS Policies

Run this in your Supabase SQL Editor:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'stickies';

-- Make sure you have a SELECT policy like this:
CREATE POLICY "Users can view their project stickies" ON stickies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stickies.project_id
      AND projects.owner_id = auth.uid()
    )
  );
```

## Step 4: Test Real-Time Connection

In your app console, after opening a project, look for:

```
✅ Successfully subscribed to real-time updates for project: <id>
```

This means real-time is working!

## Troubleshooting

### Issue: No subscription status message

**Solution:** Restart the app and check again. The subscription happens on mount.

### Issue: "CLOSED" subscription status

**Solution:**
1. Check your internet connection
2. Verify Supabase project is active
3. Check if you're on the free plan and hit connection limits

### Issue: Real-time works but checkboxes don't update

This is normal! Checkbox changes need to call `updateSticky()`. The StickyNote component should handle this automatically when you check/uncheck a box.

## Manual Refresh Fallback

If real-time doesn't work, you can manually refresh:

1. Pull down on the canvas to refresh (we can add this feature)
2. Or close and reopen the project

## Testing Real-Time

1. Open the same project on two devices (or web + mobile)
2. Create a note on one device
3. It should appear on the other device within 1-2 seconds

## Common Real-Time Issues

### Free Plan Limits

Supabase free plan has:
- **2 concurrent connections** per project
- **200 concurrent connections** total

If you're testing on multiple devices, you might hit limits.

### Network Issues

Real-time uses WebSockets. If you're on a corporate network or VPN, it might block WebSocket connections.

## Need Help?

Check the console logs and share them. Look for:
- ✅ or ❌ near "Subscription"
- Any error messages
- The payload data from INSERT events

---

## Quick Test

Run this in your app console after creating a note:

```javascript
// You should see the new note in the array
console.log('Current stickies:', stickies.length);
```

If the number increases immediately, real-time is working! 🎉
