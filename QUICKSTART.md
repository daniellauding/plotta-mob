# 🚀 Plotta Mobile - Quick Start

## ✅ Current Status

**The app is ready to run!** I've built 80% of the app for you. Here's what works:

- ✅ Authentication (sign up, sign in, password reset)
- ✅ Projects list (create, delete, view)
- ✅ User profile with settings
- ✅ Real-time sync with Supabase
- ✅ Full TypeScript type safety
- ✅ Navigation and routing
- 🚧 Canvas screen (needs to be built)
- 🚧 Sticky notes (needs to be built)

## 🏃 Quick Setup (3 Steps)

### Step 1: Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings > API** and copy:
   - Project URL
   - Anon/Public key

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Edit `.env` and paste your credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Create Database Tables

In Supabase SQL Editor, run this SQL:

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

-- Projects policies
CREATE POLICY "Users can manage their own projects"
  ON projects FOR ALL
  USING (auth.uid() = owner_id);

-- Stickies policies
CREATE POLICY "Users can manage stickies in their projects"
  ON stickies FOR ALL
  USING (
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

### Step 3: Disable Email Confirmation (for testing)

In Supabase:
1. Go to **Authentication > Settings**
2. Scroll to "Email Confirmations"
3. **Disable** "Enable email confirmations"
4. Click Save

## 🎮 Run the App

```bash
# Start the development server
npx expo start

# Then:
# - Press 'i' for iOS simulator (macOS only)
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on your phone
```

## 🧪 Test It Out

1. **Sign up** with any email (e.g., test@example.com)
2. **Create a project** by tapping the + button
3. **View your profile** in the Profile tab
4. **Sign out** and sign back in

## ✨ What I Built for You

### Authentication Flow
- `app/(auth)/sign-in.tsx` - Sign in screen
- `app/(auth)/sign-up.tsx` - Sign up screen
- `app/(auth)/reset-password.tsx` - Password reset
- `hooks/useAuth.tsx` - Auth context with protected routes

### Projects Screen
- `app/(tabs)/index.tsx` - Full CRUD for projects
- `hooks/useProjects.ts` - Real-time project sync
- Create, delete, and navigate to projects

### Profile Screen
- `app/(tabs)/profile.tsx` - User info and settings
- Sign out functionality
- App settings UI

### Database Integration
- `lib/supabase.ts` - Supabase client
- `lib/types.ts` - Full TypeScript types
- `hooks/useStickies.ts` - Ready for canvas implementation

### Infrastructure
- Expo Router navigation
- Gesture Handler & Reanimated
- Protected routes
- Real-time subscriptions

## 🎯 What's Next?

The main remaining feature is the **Canvas Screen** where users can create and drag sticky notes.

To build this, you need to:

1. **Create Canvas Screen**: `app/canvas/[id].tsx`
   - Implement pan/zoom gestures
   - Render sticky notes from database
   - Handle double-tap to create notes

2. **Create Sticky Note Component**: `components/canvas/StickyNote.tsx`
   - Make notes draggable
   - Add color picker
   - Implement note editing

Check `SETUP.md` for detailed implementation guidance!

## 📱 Recommended: Test on Real Device

The app works best on a real device:

1. Install **Expo Go** app on your phone (iOS or Android)
2. Run `npx expo start`
3. Scan the QR code with your phone
4. The app will load on your device

## 🐛 Troubleshooting

### "Module not found" error
```bash
npm install
```

### "Cannot connect to Supabase"
- Check your `.env` file has correct credentials
- Verify your Supabase project is active

### "Email not confirmed" error
- Disable email confirmations in Supabase (see Step 3)

### Version compatibility warning
```bash
npx expo install --fix
```

## 📚 Resources

- [SETUP.md](./SETUP.md) - Detailed setup with SQL
- [MOBILE_MVP_PLAN.md](./MOBILE_MVP_PLAN.md) - Full implementation plan
- [Expo Docs](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)

---

**You're all set!** The foundation is built. Now you can focus on the fun part - building the canvas with sticky notes! 🎨
