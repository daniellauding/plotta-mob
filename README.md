# 📱 Plotta Mobile

> Collaborative sticky notes canvas - now on your phone!

[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## 🎯 What is This?

Plotta Mobile brings the powerful collaborative sticky notes experience to iOS and Android. Work on your ideas anywhere, anytime, with seamless sync across all your devices.

## ✨ Features

### Core Functionality
- 📝 Create and organize sticky notes on an infinite canvas
- 🎨 Customize note colors and organize with tags
- 🔍 Search and filter notes instantly
- 👥 Collaborate in real-time with your team
- 🌐 Sync seamlessly across web, desktop, and mobile

### Mobile-Specific
- 📱 Native iOS and Android experience
- ✋ Intuitive touch gestures (pinch to zoom, drag to move)
- 📴 Offline mode with smart sync
- 🔔 Push notifications for updates
- 🎨 Dark mode support
- 📸 Attach photos from camera or gallery

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- iOS: macOS with Xcode 14+
- Android: Android Studio
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
# Clone the repository
git clone https://github.com/daniellauding/plotta-mob.git
cd plotta-mob

# Install dependencies
npm install

# Start the development server
npx expo start
```

Then:
- Press `i` to run on iOS Simulator
- Press `a` to run on Android Emulator
- Scan QR code with Expo Go app on your phone

## 📖 Documentation

- **[Getting Started Guide](./GETTING_STARTED.md)** - Set up your development environment in 30 minutes
- **[Mobile MVP Plan](./MOBILE_MVP_PLAN.md)** - Complete implementation roadmap with timelines
- **[API Documentation](#)** - Coming soon

## 🏗️ Project Structure

```
plotta-mob/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/
│   ├── canvas/            # Canvas components
│   │   ├── Canvas.tsx     # Main canvas
│   │   ├── StickyNote.tsx # Note component
│   │   └── Toolbar.tsx    # Canvas toolbar
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useProjects.ts
│   └── useStickies.ts
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── types.ts           # TypeScript types
├── utils/                 # Utility functions
└── constants/             # App constants
```

## 🎨 Design System

We follow iOS and Android design guidelines:

- **iOS**: Apple Human Interface Guidelines
- **Android**: Material Design 3
- **Colors**: Matches web app theme
- **Typography**: System fonts (SF Pro on iOS, Roboto on Android)
- **Icons**: Lucide React Native icons

## 🔧 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native + Expo |
| Language | TypeScript |
| State | React Hooks + Context |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Real-time | Supabase Realtime |
| Gestures | React Native Gesture Handler |
| Animations | React Native Reanimated |
| Navigation | Expo Router |
| Storage | AsyncStorage + SecureStore |

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests (coming soon)
npm run test:e2e

# Type checking
npx tsc --noEmit
```

## 📦 Building for Production

### iOS

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## 🎯 Roadmap

### MVP (v1.0) - 4 Weeks
- [x] Project planning
- [ ] Authentication
- [ ] Projects CRUD
- [ ] Canvas with gestures
- [ ] Real-time sync
- [ ] Offline support

### Phase 2 (v1.1) - 2 Weeks
- [ ] Photo attachments
- [ ] Push notifications
- [ ] Sharing & invites
- [ ] Advanced search

### Phase 3 (v1.2) - Future
- [ ] Voice notes
- [ ] Drawing tools
- [ ] Templates
- [ ] Integrations (Notion, Slack)

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- Expo team for the amazing framework
- Supabase for the backend infrastructure
- React Native community
- All contributors

## 📞 Support

- 📧 Email: support@plotta.app
- 💬 Discord: [Join our community](#)
- 🐛 Issues: [GitHub Issues](https://github.com/daniellauding/plotta-mob/issues)
- 📖 Docs: [Documentation](#)

## 🌟 Show Your Support

If you like this project, please give it a ⭐️ on GitHub!

---

**Made with ❤️ by the Plotta team**

## Quick Links

- 🌐 [Web App](https://plotta.app)
- 🖥️ [Desktop App](https://github.com/daniellauding/plotta-desktop)
- 📱 [iOS App Store](#) - Coming soon
- 🤖 [Google Play Store](#) - Coming soon
