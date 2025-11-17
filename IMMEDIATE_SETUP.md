# 🚨 QUICK FIX - Get Your App Working Now!

## Current Problem

Your app is running but shows "Network request failed" because it's trying to connect to a fake Supabase server.

**You need to set up Supabase first!** It takes 5 minutes.

---

## 🎯 Quick Fix (5 Steps)

### Step 1: Create Free Supabase Account

1. Open your browser and go to: **https://supabase.com**
2. Click **"Start your project"** (top right)
3. Sign up with GitHub or email
4. You'll land on your dashboard

### Step 2: Create a New Project

1. Click **"New Project"** (big green button)
2. Fill in:
   - **Name:** `plotta-mobile`
   - **Database Password:** Make up a strong password (you won't need this again)
   - **Region:** Choose the one closest to you
   - **Pricing Plan:** Free (it's selected by default)
3. Click **"Create new project"**
4. Wait ~2 minutes while it sets up (you'll see a progress screen)

### Step 3: Get Your API Keys

Once your project is ready:

1. In the left sidebar, click **Settings** (gear icon at bottom)
2. Click **API** in the settings menu
3. You'll see two important values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```

4. **Copy both of these values!**

### Step 4: Update Your .env File

1. In VS Code (or your editor), open the `.env` file in your project root
2. Replace the placeholder values with your real ones:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

**Important:** Make sure you paste YOUR actual values, not the examples above!

3. **Save the file** (Cmd+S or Ctrl+S)

### Step 5: Create Database Tables

1. Back in Supabase dashboard, click **SQL Editor** (left sidebar, looks like </> icon)
2. Click **"New query"**
3. **Copy and paste this entire SQL code:**

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT false
);

-- Create stickies table
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

-- Create policies for projects
CREATE POLICY "Users can manage their own projects"
  ON projects FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Create policies for stickies
CREATE POLICY "Users can manage stickies in their projects"
  ON stickies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stickies.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stickies.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE stickies;
```

4. Click **"RUN"** (or press Cmd/Ctrl + Enter)
5. You should see: **"Success. No rows returned"** ✅

### Step 6: Disable Email Confirmations

**IMPORTANT for testing:**

1. In Supabase, click **Authentication** (shield icon, left sidebar)
2. Click the **Settings** tab at the top
3. Scroll down to find **"Enable email confirmations"**
4. **Toggle it OFF** (make sure it's gray/disabled)
5. Click **Save** at the bottom

### Step 7: Restart Your App

1. Go to your terminal where Expo is running
2. Press **`r`** to reload the app

Or if that doesn't work:
```bash
# Stop the server (Ctrl+C)
# Start it again
npx expo start
# Press 'i' for iOS
```

---

## ✅ Test It Works!

1. You should see the **Sign In** screen (no errors!)
2. Click **"Don't have an account? Sign up"**
3. Enter:
   - Email: `test@example.com`
   - Password: `password123` (or anything you want)
   - Confirm password: same as above
4. Click **Sign Up**
5. You should be automatically signed in and see the **Projects** screen!
6. Click the **+ button** to create a project
7. Success! 🎉

---

## 🐛 Still Not Working?

### Error: "Network request failed"
- Double-check your `.env` file has the correct URL and key
- Make sure you saved the `.env` file
- Restart the Expo server (Ctrl+C, then `npx expo start`)

### Error: "Invalid credentials" or "User not found"
- Make sure you disabled email confirmations (Step 6)
- Try signing up with a different email

### Error: "Invalid supabaseUrl"
- Your `.env` file still has placeholder values
- Make sure the URL starts with `https://`
- Make sure there are no extra spaces

### Can't see the tables in Supabase
1. Go to **Table Editor** in Supabase
2. You should see `projects` and `stickies` tables
3. If not, go back to Step 5 and run the SQL again

---

## 🎉 What You Can Do Now

Once it's working, you can:
- ✅ Sign up / Sign in
- ✅ Create projects (tap the + button)
- ✅ Delete projects (tap the trash icon)
- ✅ View your profile (Profile tab)
- ✅ Sign out

**Next step:** Build the canvas screen where you can add sticky notes! (See SETUP.md for details)

---

**Need more help?** Check:
- SUPABASE_SETUP.md (detailed guide)
- QUICKSTART.md (overview)
- [Supabase Docs](https://supabase.com/docs)
