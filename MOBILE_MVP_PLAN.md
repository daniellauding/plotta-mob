# 📱 Plotta Mobile MVP - Implementation Plan

## 🎯 Project Overview

Create a React Native mobile app using Expo that brings the core Plotta experience to iOS and Android devices.

**Repository**: https://github.com/daniellauding/plotta-mob.git
**Tech Stack**: React Native + Expo + Supabase + TypeScript

---

## 📋 MVP Feature Scope

### ✅ Phase 1: Core Features (Week 1-2)

#### Authentication
- [ ] Email/Password sign up
- [ ] Email/Password sign in
- [ ] Password reset flow
- [ ] Persistent sessions
- [ ] Biometric auth (Touch ID/Face ID) - optional

#### Projects
- [ ] View all projects list
- [ ] Create new project
- [ ] Switch between projects
- [ ] Delete project (swipe to delete)

#### Sticky Notes - Basic
- [ ] View sticky notes in canvas
- [ ] Create new sticky note
- [ ] Edit note content (title + text)
- [ ] Delete sticky note
- [ ] Change note color

#### Canvas Interaction
- [ ] Pan canvas (2-finger or single-finger drag)
- [ ] Pinch to zoom
- [ ] Double-tap to create note at position
- [ ] Long-press for context menu

### ✅ Phase 2: Collaboration (Week 3)

#### Real-time Features
- [ ] Real-time note updates (Supabase)
- [ ] See when others are editing
- [ ] Offline mode with sync
- [ ] Conflict resolution

#### Sharing
- [ ] View project members
- [ ] Share project link
- [ ] Accept invitations (deep linking)

### ✅ Phase 3: Polish (Week 4)

#### UI/UX
- [ ] Dark mode support
- [ ] Pull to refresh
- [ ] Loading states
- [ ] Error handling with retry
- [ ] Haptic feedback
- [ ] Toast notifications

#### Advanced Features
- [ ] Search notes
- [ ] Filter by tags
- [ ] List view (alternative to canvas)
- [ ] Note attachments (photos from camera/gallery)

---

## 🏗️ Technical Architecture

### Core Technologies

```
plotta-mob/
├── app/                    # App Router (Expo Router)
│   ├── (auth)/            # Auth screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/            # Main app tabs
│   │   ├── projects.tsx   # Projects list
│   │   ├── canvas.tsx     # Canvas view
│   │   └── profile.tsx    # User profile
│   └── _layout.tsx        # Root layout
├── components/
│   ├── canvas/
│   │   ├── StickyNote.tsx
│   │   ├── Canvas.tsx
│   │   └── Toolbar.tsx
│   ├── ui/                # Reusable components
│   └── shared/
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── storage.ts         # AsyncStorage helpers
│   └── types.ts           # TypeScript types
├── hooks/
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useStickies.ts
│   └── useRealtime.ts
├── utils/
│   ├── canvas.ts          # Canvas calculations
│   └── gestures.ts        # Gesture handlers
└── constants/
    ├── Colors.ts
    └── Layout.ts
```

### State Management

**Use React hooks + Context for:**
- Authentication state
- Current project
- Canvas state (zoom, pan)
- Selected notes

**Use Supabase Realtime for:**
- Live note updates
- Collaborative cursors (future)

### Gesture Handling

**Use `react-native-gesture-handler` + `react-native-reanimated` for:**
- Smooth pan/zoom gestures
- Note dragging
- Multi-touch support

---

## 🎨 UI/UX Design

### Navigation Structure

```
┌─────────────────────────┐
│   Auth Flow             │
│  ┌─────────────────┐   │
│  │  Sign In        │   │
│  │  Sign Up        │   │
│  │  Reset Password │   │
│  └─────────────────┘   │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│   Main App (Tabs)       │
│  ┌─────┬────────┬─────┐│
│  │ 📁  │   🎨   │ 👤  ││
│  │Proj │ Canvas │ You ││
│  └─────┴────────┴─────┘│
└─────────────────────────┘
```

### Canvas Gestures

| Gesture | Action |
|---------|--------|
| Single tap on note | Select note |
| Double tap on canvas | Create note |
| Long press on note | Show context menu |
| Drag note | Move note |
| Pinch | Zoom canvas |
| Two-finger pan | Pan canvas |
| Swipe on note (list) | Delete/Edit |

### Color Scheme

Follow web app design:
- Use same color palette
- Respect system theme (light/dark)
- Consistent with brand

---

## 📦 Dependencies

### Essential

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react-native": "0.74.0",
    "react-native-reanimated": "~3.10.0",
    "react-native-gesture-handler": "~2.16.0",
    "react-native-svg": "15.2.0",
    "@supabase/supabase-js": "^2.43.0",
    "@react-native-async-storage/async-storage": "1.23.0",
    "expo-secure-store": "~13.0.0",
    "expo-haptics": "~13.0.0",
    "expo-status-bar": "~1.12.0"
  }
}
```

### Optional (Phase 2+)

```json
{
  "dependencies": {
    "expo-camera": "~15.0.0",
    "expo-image-picker": "~15.0.0",
    "expo-linking": "~6.3.0",
    "expo-local-authentication": "~14.0.0",
    "react-native-markdown-display": "^7.0.0",
    "zustand": "^4.5.0"
  }
}
```

---

## 🔧 Setup Instructions

### 1. Initialize Expo Project

```bash
cd /Users/daniellauding/Work/instinctly/internal/plotta-mob

# Create new Expo app with TypeScript
npx create-expo-app@latest . --template tabs

# Install additional dependencies
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install @supabase/supabase-js
npx expo install @react-native-async-storage/async-storage
npx expo install expo-secure-store expo-haptics
```

### 2. Configure Supabase

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

### 3. Environment Variables

Create `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Configure Deep Linking

Update `app.json`:

```json
{
  "expo": {
    "scheme": "plotta",
    "ios": {
      "bundleIdentifier": "com.plotta.app"
    },
    "android": {
      "package": "com.plotta.app"
    }
  }
}
```

---

## 📱 Core Components

### Canvas Component

```typescript
// components/canvas/Canvas.tsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

export function Canvas() {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = e.scale;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.canvas, animatedStyle]}>
        {/* Render sticky notes here */}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Sticky Note Component

```typescript
// components/canvas/StickyNote.tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

export function StickyNote({ note, onUpdate }) {
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      // Update note position
    })
    .onEnd(() => {
      // Save to Supabase
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={styles.note}>
        <Text>{note.title}</Text>
        <Text>{note.content}</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 🔄 Real-time Sync Strategy

### Optimistic Updates

1. User makes change → Update local state immediately
2. Show change in UI instantly
3. Send to Supabase in background
4. If fails → Revert & show error
5. If succeeds → Confirm & sync

### Conflict Resolution

```typescript
// Simple last-write-wins
if (remoteUpdatedAt > localUpdatedAt) {
  // Use remote version
  setState(remoteData);
} else {
  // Keep local version
  syncToRemote(localData);
}
```

### Offline Queue

```typescript
// Store failed operations in AsyncStorage
const offlineQueue = {
  create: [],
  update: [],
  delete: []
};

// Retry when back online
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    processOfflineQueue();
  }
});
```

---

## 🎯 Performance Optimizations

### Canvas Rendering

- [ ] Virtualize off-screen notes (only render visible)
- [ ] Use `React.memo` for note components
- [ ] Debounce position updates during drag
- [ ] Use native driver for animations

### Data Loading

- [ ] Lazy load projects (pagination)
- [ ] Cache project data in AsyncStorage
- [ ] Prefetch next project on scroll
- [ ] Compress large note content

### Battery & Network

- [ ] Batch real-time updates
- [ ] Throttle position updates (max 60fps)
- [ ] Disable real-time when app in background
- [ ] Use WebSocket keep-alive wisely

---

## 🧪 Testing Strategy

### Unit Tests (Jest)

```bash
npm test
```

Test:
- Utility functions
- State management hooks
- Canvas calculations
- Gesture handlers

### E2E Tests (Maestro or Detox)

Test flows:
- Sign up → Create project → Add note
- Edit note → See real-time update
- Offline → Create note → Go online → Sync
- Invite user → Accept → Collaborate

### Manual Testing Checklist

- [ ] iOS 15+ on iPhone SE, iPhone 14 Pro
- [ ] Android 10+ on Pixel, Samsung
- [ ] Tablet layouts (iPad, Galaxy Tab)
- [ ] Different network conditions
- [ ] Low battery mode
- [ ] Dark/light mode

---

## 📦 Build & Deploy

### Development

```bash
# Start Metro bundler
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Run on physical device
npx expo start --tunnel
```

### Production Builds

#### iOS (TestFlight)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

#### Android (Internal Testing)

```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### App Store Assets

Need to create:
- [ ] App icon (1024x1024)
- [ ] Screenshots (various sizes for iPhone/iPad/Android)
- [ ] App description
- [ ] Privacy policy URL
- [ ] Support email

---

## 🚀 Release Strategy

### Beta Release (Week 4)

- [ ] Internal testing with team (10 people)
- [ ] Fix critical bugs
- [ ] Gather feedback
- [ ] Iterate on UX

### Public Beta (Week 6)

- [ ] TestFlight (iOS) - 100 users
- [ ] Google Play Internal Testing - 100 users
- [ ] Collect analytics
- [ ] Monitor crash reports
- [ ] Fix top issues

### v1.0 Launch (Week 8)

- [ ] App Store submission
- [ ] Play Store submission
- [ ] Marketing materials
- [ ] Launch announcement
- [ ] Monitor reviews

---

## 📊 Success Metrics

### Technical KPIs

- App load time < 2s
- Canvas 60fps on mid-range devices
- Crash rate < 0.1%
- Real-time sync delay < 500ms

### User Engagement

- DAU (Daily Active Users)
- Session duration
- Notes created per user
- Projects shared
- Retention (Day 1, 7, 30)

---

## 🐛 Known Challenges & Solutions

### Challenge 1: Canvas Performance on Low-End Devices

**Solution**:
- Implement note virtualization
- Reduce max notes per canvas to 50 on low-end
- Offer "simple mode" without animations

### Challenge 2: Real-time Sync Battery Drain

**Solution**:
- Use WebSocket with smart reconnection
- Batch updates every 2-5 seconds
- Pause when app in background
- Show "sync paused" indicator

### Challenge 3: Gesture Conflicts (Pan vs Drag)

**Solution**:
- Canvas uses 2-finger pan
- Notes use 1-finger drag
- Clear visual feedback
- Tutorial on first launch

### Challenge 4: Offline Data Consistency

**Solution**:
- Queue offline operations
- Show "offline" badge on notes
- Conflict resolution UI when needed
- Auto-retry failed syncs

---

## 📚 Resources & References

### Expo Documentation
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Gesture Handler](https://docs.expo.dev/versions/latest/sdk/gesture-handler/)
- [Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/)

### Supabase Mobile
- [React Native Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)
- [Realtime](https://supabase.com/docs/guides/realtime)
- [Auth](https://supabase.com/docs/guides/auth)

### UI/UX Inspiration
- Miro mobile app
- Figma mobile
- Notion mobile
- Apple Notes

---

## 🎓 Next Steps

1. **Initialize Project** (Day 1)
   ```bash
   cd /Users/daniellauding/Work/instinctly/internal/plotta-mob
   npx create-expo-app@latest . --template tabs
   ```

2. **Set Up Supabase** (Day 1-2)
   - Configure client
   - Test authentication
   - Test database queries

3. **Build Auth Flow** (Day 3-4)
   - Sign in/up screens
   - Password reset
   - Session persistence

4. **Build Canvas** (Day 5-10)
   - Basic rendering
   - Gestures (pan, zoom, drag)
   - Create/edit notes

5. **Add Real-time** (Day 11-12)
   - Supabase subscriptions
   - Optimistic updates
   - Conflict resolution

6. **Polish & Test** (Day 13-14)
   - Dark mode
   - Error handling
   - Performance optimization

---

## ✅ Checklist Summary

### Week 1: Foundation
- [ ] Initialize Expo project
- [ ] Set up Supabase
- [ ] Build auth screens
- [ ] Implement navigation

### Week 2: Core Features
- [ ] Build canvas component
- [ ] Implement gestures
- [ ] CRUD operations for notes
- [ ] Projects list

### Week 3: Collaboration
- [ ] Real-time sync
- [ ] Offline support
- [ ] Sharing features

### Week 4: Launch Prep
- [ ] UI polish
- [ ] Testing
- [ ] Bug fixes
- [ ] Beta release

---

**Ready to start?** Run the commands in "Next Steps" section! 🚀
