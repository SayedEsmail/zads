# Zads App ⏸️ PAUSED

> **Development Status:** Paused for Phase 1. Web-first approach prioritized.  
> The codebase is ~70% complete and will resume in Phase 2.

Mobile application for the Zads educational marketplace (iOS & Android).

## Tech Stack

- Flutter 3.10+
- Riverpod 3 (State Management)
- Dio (HTTP Client)
- GoRouter (Navigation)
- Google Maps Flutter

## Current Completion

### ✅ Completed Features
- Authentication (Login, Registration)
- Parent Home Screen with search
- Teacher Home Screen with dashboard
- Teacher Profile View/Edit
- Teacher Subjects Management
- Parent Profile Edit
- Parent Location Edit
- Parent Children Management
- Parent Requests Screen

### ⏳ Pending (for Phase 2)
- Onboarding screens
- Favorites UI
- Settings & Notifications
- Push notifications
- App store deployment

## Prerequisites

- Flutter SDK 3.10+
- Xcode (for iOS)
- Android Studio (for Android)
- Running Zads API

## Setup

1. **Install dependencies:**
```bash
cd zads_app
flutter pub get
```

2. **Configure API URL:**

Edit `lib/core/network/dio_client.dart`:
```dart
baseUrl: 'http://localhost:3000/api',  // iOS Simulator
// baseUrl: 'http://10.0.2.2:3000/api',  // Android Emulator
```

## Running Locally

```bash
# List available devices
flutter devices

# Run on iOS Simulator
flutter run -d ios

# Run on Android Emulator
flutter run -d android

# Run on Chrome (web)
flutter run -d chrome
```

> **Note:** Make sure the API (`zads-api`) is running first!

## Project Structure

```
lib/
├── core/           # Theme, Network, Router
├── features/       # Auth, Teachers, Parents, Home
├── l10n/           # Arabic translations
├── app.dart        # Main app widget
└── main.dart       # Entry point
```

## Build

```bash
# Build APK (Android)
flutter build apk --release

# Build App Bundle (Play Store)
flutter build appbundle --release

# Build iOS
flutter build ios --release
```

## Language

The app is fully in **Arabic (RTL)** using the Cairo font.

---

*See [TECH_PLAN.md](./TECH_PLAN.md) for detailed technical documentation.*

*Development paused: February 7, 2026*
