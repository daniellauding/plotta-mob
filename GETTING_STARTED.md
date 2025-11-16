# 🚀 Getting Started with Plotta Mobile

Quick guide to get your mobile app running in 30 minutes.

## Prerequisites

- Node.js 18+ installed
- iOS: Xcode 14+ and iOS Simulator
- Android: Android Studio and emulator
- Expo Go app on your phone (for testing)

## Step-by-Step Setup

### 1. Initialize the Project

```bash
cd /Users/daniellauding/Work/instinctly/internal/plotta-mob

# Create Expo app with TypeScript
npx create-expo-app@latest . --template tabs

# Say YES to all prompts
```

### 2. Install Dependencies

```bash
# Core dependencies
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install react-native-svg
npx expo install @supabase/supabase-js
npx expo install @react-native-async-storage/async-storage
npx expo install expo-secure-store
npx expo install expo-haptics
npx expo install react-native-url-polyfill

# Development dependencies
npm install -D @types/react @types/react-native
```

### 3. Create Environment File

Create `.env` in project root:

```env
# Copy these from your Supabase project settings
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Configure Supabase Client

Create `lib/supabase.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 5. Test Supabase Connection

Create `app/(tabs)/test.tsx`:

```typescript
import { View, Text, Button } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function TestScreen() {
  const [connected, setConnected] = useState(false);

  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('count')
        .limit(1);

      if (error) throw error;
      setConnected(true);
      alert('✅ Connected to Supabase!');
    } catch (error) {
      alert('❌ Connection failed: ' + error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>
        Supabase Connection Test
      </Text>
      <Button title="Test Connection" onPress={testConnection} />
      {connected && <Text style={{ marginTop: 20, color: 'green' }}>✓ Connected!</Text>}
    </View>
  );
}
```

### 6. Run the App

```bash
# Start Expo Dev Server
npx expo start

# Then choose:
# - Press 'i' for iOS Simulator
# - Press 'a' for Android Emulator
# - Scan QR code with Expo Go app on your phone
```

## Verify Setup

You should see:
1. ✅ App loads without errors
2. ✅ Tabs are visible at bottom
3. ✅ Can navigate between screens
4. ✅ Supabase connection test passes

## Next Steps

### Phase 1: Authentication (Days 1-2)

**Goal**: Users can sign up, sign in, and sign out

**Files to create**:
```
app/(auth)/
├── sign-in.tsx       # Sign in screen
├── sign-up.tsx       # Sign up screen
└── _layout.tsx       # Auth layout

hooks/
└── useAuth.ts        # Auth hook

contexts/
└── AuthContext.tsx   # Auth state
```

**Key features**:
- Email/password authentication
- Session persistence
- Protected routes
- Sign out

### Phase 2: Projects List (Days 3-4)

**Goal**: Users can view and create projects

**Files to create**:
```
app/(tabs)/
└── projects.tsx      # Projects list

components/
├── ProjectCard.tsx   # Project item
└── ProjectList.tsx   # List component

hooks/
└── useProjects.ts    # Projects CRUD
```

**Key features**:
- Fetch user's projects from Supabase
- Create new project
- Delete project (swipe to delete)
- Navigation to canvas

### Phase 3: Canvas View (Days 5-10)

**Goal**: Users can view and interact with sticky notes

**Files to create**:
```
app/(tabs)/
└── canvas.tsx        # Canvas screen

components/canvas/
├── Canvas.tsx        # Main canvas
├── StickyNote.tsx    # Note component
└── Toolbar.tsx       # Canvas toolbar

hooks/
├── useStickies.ts    # Stickies CRUD
└── useCanvas.ts      # Canvas state

utils/
├── gestures.ts       # Gesture handlers
└── canvas.ts         # Canvas math
```

**Key features**:
- Pan and zoom canvas
- Display sticky notes
- Create note (double tap)
- Edit note content
- Delete note
- Move note (drag)

### Phase 4: Real-time Sync (Days 11-12)

**Goal**: Changes sync across devices in real-time

**Files to update**:
```
hooks/
├── useStickies.ts    # Add real-time subscriptions
└── useRealtime.ts    # Real-time hook
```

**Key features**:
- Subscribe to note changes
- Optimistic updates
- Conflict resolution
- Offline queue

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution**:
```bash
npm install @supabase/supabase-js
npx expo start -c  # Clear cache
```

### Issue: "Network request failed"

**Solution**:
1. Check `.env` file exists with correct values
2. Restart Expo dev server
3. Check Supabase project is not paused
4. Verify API keys in Supabase dashboard

### Issue: Gestures not working

**Solution**:
1. Make sure you installed `react-native-gesture-handler`
2. Wrap app in `GestureHandlerRootView`:

```typescript
// app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Your app */}
    </GestureHandlerRootView>
  );
}
```

### Issue: "Invariant Violation" on Android

**Solution**:
```bash
# Clear cache and rebuild
npx expo start -c
# Then press 'a' to rebuild Android
```

## Development Tips

### Hot Reload

- Changes auto-refresh on save
- Shake device for dev menu
- `r` in terminal to reload
- `m` to open dev menu

### Debugging

**React DevTools**:
```bash
npx react-devtools
```

**Inspect Network**:
```bash
# In Expo DevTools, enable Network inspect
# Or use Flipper for advanced debugging
```

**Console Logs**:
```typescript
console.log('Debug:', data);
console.warn('Warning:', error);
console.error('Error:', error);
```

### Code Quality

**Format code**:
```bash
npm install -D prettier
npx prettier --write .
```

**Lint code**:
```bash
npm run lint
```

## Performance Tips

1. **Use React.memo** for note components
2. **Virtualize lists** with FlashList
3. **Optimize images** - use WebP format
4. **Lazy load** off-screen content
5. **Debounce** position updates

## Resources

- 📖 [Expo Documentation](https://docs.expo.dev/)
- 📖 [React Native Documentation](https://reactnative.dev/)
- 📖 [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)
- 🎥 [Expo Tutorial Videos](https://www.youtube.com/c/expo)
- 💬 [Expo Discord](https://chat.expo.dev/)

## Getting Help

1. Check [MOBILE_MVP_PLAN.md](./MOBILE_MVP_PLAN.md) for full details
2. Review Expo docs for specific issues
3. Search GitHub Issues
4. Ask in Expo Discord
5. Create GitHub issue with details

## Success Checklist

- [ ] Expo app runs on iOS simulator
- [ ] Expo app runs on Android emulator
- [ ] Expo app runs on physical device
- [ ] Supabase connection works
- [ ] Can sign up/in/out
- [ ] Can create project
- [ ] Can view projects list
- [ ] Can create sticky note
- [ ] Can edit sticky note
- [ ] Can drag sticky note
- [ ] Real-time sync works

**Once all checked ✅ - You're ready to build!** 🎉
