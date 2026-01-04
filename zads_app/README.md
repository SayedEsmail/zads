# Zads App

Mobile application for the Zads educational marketplace (iOS & Android).

## Tech Stack

- Flutter 3.10+
- Riverpod 3 (State Management)
- Dio (HTTP Client)
- GoRouter (Navigation)
- Google Maps Flutter

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

## Features

### Parent Flow
- 🔍 Search teachers by location/subject
- 👤 View teacher profiles
- ❤️ Save favorites
- 📨 Send contact requests

### Teacher Flow
- 📊 Dashboard with stats
- ✏️ Edit profile & pricing
- 📥 Receive contact requests

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

## Troubleshooting

### API Connection on Android Emulator
Use `10.0.2.2` instead of `localhost` to connect to host machine.

### iOS Simulator Network
Add to `Info.plist` for non-HTTPS connections:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```
