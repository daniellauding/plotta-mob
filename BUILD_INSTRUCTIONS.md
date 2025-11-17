# 📦 Plotta Mobile - Build & Deploy Instructions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npx expo start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

## Building for Preview (Testing)

Preview builds allow you to test the app on devices without going through the App Store.

### Prerequisites
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Configure your project:
   ```bash
   eas build:configure
   ```

### iOS Preview Build

**For iOS Simulator:**
```bash
eas build --profile preview --platform ios
```

This creates a `.app` file you can install in the iOS Simulator.

**For Physical iOS Device (Ad Hoc):**
1. Register your device UUID:
   ```bash
   eas device:create
   ```
2. Build with device provisioning:
   ```bash
   eas build --profile preview --platform ios
   ```
3. Download and install the `.ipa` file

### Android Preview Build

**APK (easier for testing):**
```bash
eas build --profile preview --platform android
```

This creates an APK you can install directly on Android devices.

**Install the APK:**
1. Download the APK from the build link
2. Transfer to your Android device
3. Enable "Install from Unknown Sources" in Settings
4. Tap the APK to install

## Building for Production (App Stores)

### iOS Production Build

**1. Apple Developer Account Setup:**
- Enroll in Apple Developer Program ($99/year)
- Create an App ID for `com.instinctly.plotta`
- Create App Store Connect app listing

**2. Build for App Store:**
```bash
eas build --profile production --platform ios
```

**3. Submit to App Store:**
```bash
eas submit --platform ios
```

Or manually:
1. Download the `.ipa` file
2. Upload via Transporter app
3. Submit for review in App Store Connect

### Android Production Build

**1. Google Play Console Setup:**
- Create Google Play Developer account ($25 one-time)
- Create new app for "Plotta"
- Set up app listing

**2. Build for Play Store:**
```bash
eas build --profile production --platform android
```

**3. Submit to Google Play:**
```bash
eas submit --platform android
```

Or manually:
1. Download the `.aab` file
2. Upload to Google Play Console
3. Create a release and submit for review

## EAS Build Profiles

Your `eas.json` has three profiles:

### Development
```json
{
  "developmentClient": true,
  "distribution": "internal"
}
```
- For testing with Expo Dev Client
- Includes developer tools
- Supports OTA updates

### Preview
```json
{
  "distribution": "internal",
  "ios": { "simulator": true },
  "android": { "buildType": "apk" }
}
```
- For internal testing
- iOS: Simulator builds or Ad Hoc
- Android: APK for easy installation

### Production
```json
{
  "ios": { "buildConfiguration": "Release" },
  "android": { "buildType": "apk" }
}
```
- Optimized for App Store / Play Store
- No dev tools
- Smallest bundle size

## Over-The-Air (OTA) Updates

After users install your app, you can push updates without rebuilding:

**1. Make your code changes**

**2. Publish update:**
```bash
eas update --branch production --message "Bug fixes"
```

**Note:** OTA updates work for JavaScript/React code, but NOT for:
- Native dependencies
- App.json changes
- Assets changes

## CI/CD with GitHub Actions

Create `.github/workflows/build.yml`:

```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm install -g eas-cli
      - run: eas build --profile preview --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

Get `EXPO_TOKEN`:
```bash
eas whoami
# Copy your token from the output
```

## Build Troubleshooting

### "Build failed: Metro bundler error"
```bash
# Clear cache and try again
npx expo start --clear
eas build --profile preview --platform ios --clear-cache
```

### "Could not find matching credentials"
```bash
# Let EAS generate credentials
eas build --profile production --platform ios
# Follow prompts to generate new certificates
```

### "Bundle identifier conflict"
- Make sure `ios.bundleIdentifier` in app.json matches your Apple Developer account
- Check that the bundle ID is registered in Apple Developer Portal

### "Version already exists"
- Increment `version` in app.json (e.g., "1.0.0" → "1.0.1")
- Increment build number if needed

### "APK won't install on Android"
- Enable "Install from Unknown Sources"
- Check that device Android version meets minimum requirements
- Try downloading the APK again

## Testing Checklist

Before submitting to stores:

**Functionality:**
- [ ] Sign up / Sign in works
- [ ] Create project works
- [ ] Create sticky notes works
- [ ] Drag notes smoothly (no crashes)
- [ ] Edit notes works
- [ ] Delete notes works
- [ ] All 8 colors work
- [ ] Dark mode works
- [ ] Canvas pan/zoom works

**Performance:**
- [ ] App loads quickly
- [ ] No memory warnings
- [ ] Smooth 60fps animations
- [ ] Works with 20+ sticky notes

**Compatibility:**
- [ ] iOS 13+ works
- [ ] Android 5.0+ works
- [ ] Works on tablets
- [ ] Works on different screen sizes

**Polish:**
- [ ] Icons look good
- [ ] Splash screen appears
- [ ] No console warnings
- [ ] Haptic feedback works
- [ ] Real-time sync works

## Environment Variables

Make sure `.env` has:
```
EXPO_PUBLIC_SUPABASE_URL=your-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
```

For production builds, set in EAS:
```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
```

## App Store Requirements

### iOS
- App icon (1024x1024)
- Screenshots (6.5", 5.5", 12.9" iPad)
- Privacy policy URL
- App description
- Keywords
- Support URL
- Age rating

### Android
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (phone, 7" tablet, 10" tablet)
- Privacy policy URL
- App description
- Category
- Content rating

## Versioning

Follow semantic versioning:

**Format:** `MAJOR.MINOR.PATCH`

Examples:
- `1.0.0` - Initial release
- `1.0.1` - Bug fix
- `1.1.0` - New feature
- `2.0.0` - Breaking changes

Update in `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

## Useful Commands

```bash
# Check Expo doctor for issues
npx expo-doctor

# View build status
eas build:list

# View update status
eas update:list

# Cancel running build
eas build:cancel

# Download build artifacts
eas build:download --platform ios

# View build logs
eas build:view

# Check which profile will be used
eas build --profile preview --platform ios --local
```

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

---

**You're all set to build and deploy Plotta Mobile! 🚀**

For questions or issues, refer to:
- `INSTALLATION.md` - Development setup
- `SETUP_COMPLETE.md` - Feature documentation
- `CRASH_FIXED.md` - Bug fix history
