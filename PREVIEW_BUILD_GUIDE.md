# Installing Plotta Preview Builds

This guide will walk you through installing preview builds of the Plotta mobile app on your Android or iOS device.

## Prerequisites

1. **Install Expo Go** (for testing without builds) or prepare for internal distribution
2. **Expo Account** - Sign up at https://expo.dev if you don't have one
3. **EAS CLI** - Install globally:
   ```bash
   npm install -g eas-cli
   ```
4. **Login to EAS**:
   ```bash
   eas login
   ```

## Building Preview Builds

### 1. Configure EAS Project

First, link your project to EAS (one-time setup):

```bash
eas build:configure
```

This will:
- Create an EAS project ID (if not already set)
- Update your `app.json` with the project configuration

### 2. Build for Android

```bash
eas build --profile preview --platform android
```

This will:
- Build an APK file (not AAB) for easy installation
- Use internal distribution
- Take approximately 10-15 minutes

### 3. Build for iOS

```bash
eas build --profile preview --platform ios
```

This will:
- Build an iOS app for internal distribution
- Create a build that can run on physical devices
- Take approximately 15-20 minutes

**Note for iOS**: You'll need an Apple Developer account ($99/year) to install on physical devices. For testing in iOS Simulator on Mac:

```bash
eas build --profile preview --platform ios
```

The preview profile is already configured for simulator builds in `eas.json:12-13`.

### 4. Build for Both Platforms

```bash
eas build --profile preview --platform all
```

## Installing on Devices

### Android Installation

#### Method 1: Direct Install via QR Code
1. After the build completes, EAS will provide a QR code in the terminal
2. Open the camera app on your Android device
3. Scan the QR code
4. Tap the notification to download the APK
5. If prompted, allow installation from unknown sources:
   - Go to **Settings > Security > Unknown Sources**
   - Or **Settings > Apps > Special Access > Install Unknown Apps**
6. Tap the downloaded APK to install

#### Method 2: Download from EAS Dashboard
1. Visit https://expo.dev/accounts/[your-account]/projects/plotta-mobile/builds
2. Find your latest preview build
3. Click the build and download the APK
4. Transfer to your Android device via:
   - Email attachment
   - Cloud storage (Google Drive, Dropbox)
   - USB cable (copy to Downloads folder)
5. Open the APK file on your device to install

#### Method 3: Install via ADB
```bash
# Download the APK from EAS dashboard, then:
adb install path/to/downloaded.apk
```

### iOS Installation (Physical Devices)

#### Prerequisites
- Apple Developer Account ($99/year)
- Device UDID registered in Apple Developer Portal

#### Method 1: Ad Hoc Distribution
1. Register device UDIDs:
   ```bash
   eas device:create
   ```
2. Build with registered devices:
   ```bash
   eas build --profile preview --platform ios
   ```
3. Install via QR code or link from EAS dashboard
4. On your iOS device:
   - Open Safari and scan QR code or visit the build URL
   - Tap "Install"
   - Go to **Settings > General > VPN & Device Management**
   - Trust the developer profile

#### Method 2: TestFlight (Recommended for Multiple Testers)
1. Update `eas.json` to use TestFlight:
   ```json
   "preview": {
     "distribution": "internal",
     "ios": {
       "simulator": false
     }
   }
   ```
2. Build and submit:
   ```bash
   eas build --profile preview --platform ios
   eas submit --platform ios --latest
   ```
3. Invite testers via App Store Connect
4. Testers install TestFlight app from App Store
5. Testers receive invitation and can install the build

### iOS Installation (Simulator - Mac Only)

1. Build for simulator (already configured in `eas.json:12-13`):
   ```bash
   eas build --profile preview --platform ios
   ```
2. Download the `.tar.gz` file from the build page
3. Extract and install:
   ```bash
   tar -xvf path/to/build.tar.gz
   xcrun simctl install booted path/to/Plotta.app
   ```
4. Open simulator and launch the app

### iPad Installation

Same as iPhone - iOS builds support both iPhone and iPad automatically (configured in `app.json:17` with `supportsTablet: true`).

## Sharing Builds with Team Members

### Share Build Link
After the build completes:
1. Copy the build URL from terminal or EAS dashboard
2. Share with team members
3. They can install directly from their devices

### Add Team Members to EAS Project
```bash
eas project:member:add [email@example.com]
```

Team members will be able to:
- View all builds
- Download and install builds
- Trigger new builds (if given permission)

## Updating the App

When you push updates:

1. **For minor updates** (no native code changes):
   ```bash
   eas update --branch preview
   ```
   Updates will be delivered over-the-air automatically.

2. **For major updates** (native code changes):
   ```bash
   eas build --profile preview --platform all
   ```
   Users need to install the new build.

## Troubleshooting

### Android: "App not installed"
- Uninstall the previous version first
- Enable installation from unknown sources
- Check if you have enough storage space

### iOS: "Unable to install"
- Ensure device UDID is registered
- Check that provisioning profile is valid
- Trust the developer certificate in Settings

### Build Failed
- Check build logs: `eas build:list`
- View detailed logs on EAS dashboard
- Common issues:
  - Missing environment variables
  - Native dependency issues
  - Apple Developer account problems

### App Crashes on Launch
- Check Supabase credentials in `.env`
- Verify all native dependencies are installed
- Check crash logs:
  - Android: `adb logcat`
  - iOS: Xcode Devices & Simulators > View Device Logs

## Viewing Build Status

### Terminal
```bash
eas build:list
```

### Web Dashboard
https://expo.dev/accounts/[your-account]/projects/plotta-mobile/builds

## Development vs Preview vs Production

- **Development**: Includes developer tools, connects to Metro bundler
- **Preview**: Standalone app for internal testing (current profile)
- **Production**: Optimized for app store submission

## Next Steps

1. **Set up OTA updates**: Configure update channels for instant updates
2. **Add environment variables**: Store API keys securely with EAS Secrets
3. **Configure app signing**: Set up for Play Store/App Store submission
4. **Set up CI/CD**: Automate builds with GitHub Actions

## Useful Commands

```bash
# View all builds
eas build:list

# View specific build details
eas build:view [build-id]

# Cancel a running build
eas build:cancel

# View build logs
eas build:logs [build-id]

# Configure environment variables
eas secret:create --scope project --name SUPABASE_URL --value your-value

# View project info
eas project:info
```

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Internal Distribution](https://docs.expo.dev/build/internal-distribution/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
