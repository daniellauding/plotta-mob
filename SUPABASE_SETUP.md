# 🔧 Supabase Setup Guide

## Current Issue

The app is running but showing this error:
```
ERROR [Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.]
```

This is because you need to set up your Supabase project first!

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Fill in:
   - **Name**: plotta-mobile (or whatever you like)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
6. Click "Create new project" and wait ~2 minutes

### Step 2: Get Your API Credentials

1. In your Supabase dashboard, click on your project
2. Go to **Settings** (gear icon on left sidebar)
3. Click **API** in the settings menu
4. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API keys** → Copy the `anon` `public` key

### Step 3: Update Your .env File

Open the `.env` file in your project root and replace the placeholder values:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

**Important:** Replace both values with your actual Supabase credentials!

### Step 4: Create Database Tables

1. In Supabase dashboard, click **SQL Editor** (icon on left sidebar)
2. Click **New query**
3. Copy and paste this SQL:

```sql
-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT false
);

-- Stickies table
CREATE TABLE stickies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  color TEXT DEFAULT 'yellow',
  position_x REAL DEFAULT 0,
  position_y REAL DEFAULT 0,
  width REAL DEFAULT 200,
  height REAL DEFAULT 200,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickies ENABLE ROW LEVEL SECURITY;

-- Projects policies (users can only see their own projects)
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Stickies policies
CREATE POLICY "Users can view stickies in their projects"
  ON stickies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stickies.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create stickies"
  ON stickies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stickies.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stickies"
  ON stickies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stickies.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stickies"
  ON stickies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stickies.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE stickies;
```

4. Click **RUN** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### Step 5: Disable Email Confirmation (for testing)

This step is **important** for testing - otherwise you'll need to verify every test email!

1. Go to **Authentication** (shield icon on left sidebar)
2. Click **Settings** tab
3. Scroll down to **Email Auth**
4. Find "Enable email confirmations"
5. **Toggle it OFF** (disable it)
6. Click **Save**

### Step 6: Restart Your App

1. Stop the Expo server (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npx expo start
   ```
3. Press `i` for iOS or `a` for Android

## ✅ Test It Works

1. You should see the **Sign In** screen
2. Click "Don't have an account? Sign up"
3. Enter any email (e.g., `test@example.com`) and password
4. Click **Sign Up**
5. You should be signed in and see the **Projects** screen!

## 🎉 You're Done!

The app should now work perfectly:
- ✅ Sign up / Sign in
- ✅ Create projects
- ✅ Real-time sync
- ✅ User profile

## 🐛 Troubleshooting

### Still seeing "Invalid supabaseUrl" error?

1. Check your `.env` file has actual values (not placeholders)
2. Restart the Expo server after changing `.env`
3. Make sure the URL starts with `https://`

### "Email not confirmed" error?

- Go back to Step 5 and make sure email confirmations are disabled

### Can't see your projects?

- Check the SQL ran successfully (no errors)
- Make sure RLS policies were created
- Try signing out and back in

### Tables not created?

Run this to check:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see `projects` and `stickies` in the results.

## 📚 Next Steps

Once Supabase is working:
- Create some projects
- Test real-time sync (open app on 2 devices)
- Build the canvas screen (see SETUP.md)

Need help? Check the [Supabase Documentation](https://supabase.com/docs)
