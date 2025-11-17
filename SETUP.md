# Plotta Mobile - Setup & Progress

## What Has Been Built

I've created a comprehensive React Native mobile app foundation with the following features:

### ✅ Completed Features

1. **Project Initialization**
   - Expo project with TypeScript
   - All core dependencies installed (Supabase, Gesture Handler, Reanimated, etc.)

2. **Authentication System**
   - Sign-in screen (`app/(auth)/sign-in.tsx`)
   - Sign-up screen (`app/(auth)/sign-up.tsx`)
   - Password reset screen (`app/(auth)/reset-password.tsx`)
   - Auth context with hooks (`hooks/useAuth.tsx`)
   - Protected routes with automatic navigation

3. **Database Integration**
   - Supabase client configuration (`lib/supabase.ts`)
   - TypeScript types for all database models (`lib/types.ts`)
   - Real-time subscriptions configured

4. **Projects Management**
   - Projects list screen with CRUD operations (`app/(tabs)/index.tsx`)
   - Create, read, update, delete projects
   - Real-time project updates via Supabase
   - Custom hook for projects (`hooks/useProjects.ts`)

5. **Sticky Notes System**
   - Custom hook for sticky notes with real-time sync (`hooks/useStickies.ts`)
   - CRUD operations for sticky notes
   - Real-time updates when other users edit

6. **User Profile**
   - Profile screen with user information (`app/(tabs)/profile.tsx`)
   - Sign out functionality
   - App settings UI

7. **Navigation**
   - Tab navigation (Projects, Profile)
   - Auth flow with automatic redirects
   - Modal support for additional screens

### 🚧 What Still Needs to Be Built

1. **Canvas Screen** (Main Feature)
   - Create `app/canvas/[id].tsx` for the canvas view
   - Implement pan and zoom gestures using Reanimated
   - Render sticky notes on the canvas
   - Create sticky note component with drag functionality

2. **Sticky Note Component**
   - Create `components/canvas/StickyNote.tsx`
   - Implement draggable notes
   - Add color picker
   - Add note editing modal

3. **Offline Support**
   - Queue offline operations
   - Sync when back online
   - Conflict resolution

4. **Polish**
   - Dark mode implementation
   - Better error handling
   - Loading states
   - Haptic feedback

## Setup Instructions

### 1. Configure Supabase

You need to set up your Supabase project and database:

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

#### Create Database Tables

Run this SQL in your Supabase SQL Editor:

\`\`\`sql
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

-- Project members table
CREATE TABLE project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer'))
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickies ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects"
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

CREATE POLICY "Users can create stickies in their projects"
  ON stickies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stickies.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stickies in their projects"
  ON stickies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stickies.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stickies in their projects"
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
ALTER PUBLICATION supabase_realtime ADD TABLE project_members;
\`\`\`

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Then edit `.env` with your Supabase credentials:

\`\`\`
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 3. Run the App

\`\`\`bash
# Start the Metro bundler
npx expo start

# Run on iOS (requires macOS)
npx expo start --ios

# Run on Android
npx expo start --android

# Run in browser
npx expo start --web
\`\`\`

## Next Steps to Complete the App

### 1. Create Canvas Screen

Create `app/canvas/[id].tsx` with pan/zoom gestures:

\`\`\`typescript
// This is a starting point - you'll need to build this out
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useStickies } from '../../hooks/useStickies';

export default function CanvasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stickies, createSticky } = useStickies(id);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Implement gestures...

  return (
    <View style={{ flex: 1 }}>
      {/* Canvas implementation */}
    </View>
  );
}
\`\`\`

### 2. Create Sticky Note Component

Create `components/canvas/StickyNote.tsx` with drag gestures and editing.

### 3. Test the App

1. Sign up for an account
2. Create a project
3. Add sticky notes
4. Test real-time sync (open app on two devices)

## File Structure

\`\`\`
plotta-mob/
├── app/
│   ├── (auth)/              # Authentication screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Projects list
│   │   └── profile.tsx      # User profile
│   ├── canvas/              # Canvas screens (TO CREATE)
│   │   └── [id].tsx         # Canvas for specific project
│   └── _layout.tsx          # Root layout
├── components/
│   ├── canvas/              # Canvas components (TO CREATE)
│   └── ui/                  # Reusable UI components
├── hooks/
│   ├── useAuth.tsx          # Authentication hook
│   ├── useProjects.ts       # Projects CRUD hook
│   └── useStickies.ts       # Stickies CRUD hook
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── types.ts             # TypeScript types
└── utils/                   # Utility functions
\`\`\`

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Run `npm install` to ensure all dependencies are installed

2. **Supabase connection errors**
   - Check your `.env` file has the correct credentials
   - Ensure your Supabase project is running

3. **Authentication not working**
   - Check that email confirmation is disabled in Supabase Auth settings
   - Or configure your email provider in Supabase

4. **Real-time not working**
   - Ensure you've enabled realtime for your tables
   - Check that RLS policies allow SELECT operations

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Supabase Documentation](https://supabase.com/docs)
- [Expo Router](https://expo.github.io/router/)

## Support

If you encounter issues, please check:
1. The MOBILE_MVP_PLAN.md for detailed implementation guidance
2. The GETTING_STARTED.md for initial setup steps
3. GitHub Issues for common problems

Good luck building your app! 🚀
