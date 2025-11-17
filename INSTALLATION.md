# 📱 Plotta Mobile - Installation Guide

## Prerequisites

Before starting, make sure you have:

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **iOS Simulator** (macOS only) or **Android Emulator**
- **Expo Go app** on your physical device (optional)

## Step-by-Step Installation

### 1. Install Dependencies

From the project directory:

```bash
cd /Users/daniellauding/Work/instinctly/internal/plotta-mob
npm install
```

This will install all required packages including:
- Expo SDK
- React Native
- Supabase client
- Gesture handler
- Navigation libraries

### 2. Environment Setup

Your `.env` file is already configured with Supabase credentials. If you need to verify:

```bash
cat .env
```

You should see:
```
EXPO_PUBLIC_SUPABASE_URL=https://dvdhbhgarkhkywrncorj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Start the Development Server

```bash
npx expo start
```

Or use the npm script:
```bash
npm start
```

This will start Metro bundler and show you a QR code.

### 4. Run on iOS Simulator

Once Expo is running, press:

```
i
```

This will:
- Launch iOS Simulator automatically
- Install Expo Go
- Load your app

**Note:** Requires macOS with Xcode installed.

### 5. Run on Android Emulator

Once Expo is running, press:

```
a
```

This will:
- Launch Android Emulator if available
- Install Expo Go
- Load your app

**Note:** Requires Android Studio with an emulator configured.

### 6. Run on Physical Device

**Option A: Scan QR Code**
1. Install **Expo Go** from:
   - iOS: App Store
   - Android: Google Play Store
2. Open Expo Go app
3. Scan the QR code from your terminal
4. App will load on your device

**Option B: Manual Connection**
1. Make sure your phone and computer are on the same WiFi
2. In Expo Go, tap "Enter URL manually"
3. Enter the URL shown in terminal (e.g., `exp://192.168.1.x:8081`)

## First Time Setup in App

### 1. Sign Up
- Open the app
- Tap "Sign Up"
- Enter email and password
- Check your email for verification (Supabase will send one)

### 2. Sign In
- After verification, tap "Sign In"
- Enter your credentials
- You'll be taken to the Projects screen

### 3. Create Your First Project
- Tap the **+** button
- Enter project name and description
- Tap "Create"

### 4. Open Canvas
- Tap on your project card
- You'll see the empty canvas

### 5. Create Sticky Notes
- Tap the **+** button in the header
- Enter title and content
- Choose a color
- Tap "Create"

### 6. Interact with Notes
- **Drag:** Touch and drag to move
- **Edit:** Double-tap or long-press
- **Delete:** Open editor, tap delete button
- **Canvas:** Use two fingers to pan/zoom

## Troubleshooting

### "Network request failed"
- Make sure Expo dev server is running
- Press `r` in terminal to reload
- Check WiFi connection (device and computer must be on same network)

### "Cannot connect to Metro"
- Stop Expo (Ctrl+C)
- Clear cache: `npx expo start --clear`
- Restart

### App crashes when dragging notes
- This should be fixed! But if it happens:
- Press `r` to reload
- Make sure you pulled latest changes

### "Unable to resolve module"
- Clear cache: `npx expo start --clear`
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`

### iOS Simulator not opening
- Make sure Xcode is installed
- Open Xcode at least once to accept license
- Check Simulator app is available

### Android Emulator not opening
- Make sure Android Studio is installed
- Create an emulator in AVD Manager
- Start emulator manually first

## Useful Commands

```bash
# Start development server
npm start

# Start with cache cleared
npx expo start --clear

# iOS only
npm run ios

# Android only
npm run android

# Check for issues
npx expo doctor
```

## Development Tips

### Hot Reload
- Changes to code auto-reload
- Press `r` to manually reload
- Press `m` to toggle menu
- Shake device for dev menu

### Debugging
- Press `j` to open Chrome DevTools
- Use `console.log()` - shows in terminal
- Install React Native Debugger for better experience

### Building for Production
```bash
# iOS build
eas build --platform ios

# Android build
eas build --platform android
```

**Note:** Requires EAS account and configuration.

## What's Working

✅ User authentication (sign up, sign in, sign out)
✅ Projects management (create, list, delete)
✅ Canvas with pan/zoom
✅ Sticky notes (create, edit, delete, drag)
✅ Real-time sync across devices
✅ Persistent storage
✅ Haptic feedback
✅ Gesture handling

## Known Issues

None currently! 🎉

If you find any issues, please report them.

---

**You're all set! Enjoy using Plotta Mobile! 🎨**
