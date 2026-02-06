# Zads App - Technical Plan ⏸️ PAUSED

> **Development Status:** Paused for Phase 1. Web-first approach prioritized.
> The codebase is ~70% complete and will resume in Phase 2.

## Overview
Mobile application for the Zads platform (iOS & Android). Built with Flutter using Riverpod for state management.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Flutter 3.10+ |
| State Management | Riverpod 3 |
| HTTP Client | Dio |
| Routing | GoRouter |
| Maps | google_maps_flutter |
| Storage | shared_preferences |
| Fonts | Google Fonts (Cairo) |

---

## Project Structure

```
zads_app/
├── assets/
│   └── images/
│       └── logo.png
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   ├── theme/
│   │   │   ├── app_colors.dart
│   │   │   └── app_theme.dart
│   │   ├── network/
│   │   │   └── dio_client.dart
│   │   ├── router/
│   │   │   └── app_router.dart
│   │   └── utils/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   └── auth_repository.dart
│   │   │   ├── presentation/
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── user_type_selection_screen.dart
│   │   │   │   ├── parent_register_screen.dart
│   │   │   │   └── teacher_register_screen.dart
│   │   │   └── providers/
│   │   │       └── auth_provider.dart
│   │   ├── home/
│   │   │   └── presentation/
│   │   │       ├── parent_home_screen.dart
│   │   │       └── teacher_home_screen.dart
│   │   ├── teacher/
│   │   │   ├── data/
│   │   │   │   └── teacher_repository.dart
│   │   │   ├── presentation/
│   │   │   │   ├── teacher_profile_view_screen.dart
│   │   │   │   ├── teacher_profile_edit_screen.dart
│   │   │   │   └── teacher_subjects_screen.dart
│   │   │   └── providers/
│   │   │       └── teacher_provider.dart
│   │   ├── parent/
│   │   │   ├── data/
│   │   │   │   └── parent_repository.dart
│   │   │   ├── presentation/
│   │   │   │   ├── parent_profile_edit_screen.dart
│   │   │   │   ├── parent_location_edit_screen.dart
│   │   │   │   ├── parent_children_manage_screen.dart
│   │   │   │   ├── parent_requests_screen.dart
│   │   │   │   └── request_details_screen.dart
│   │   │   └── providers/
│   │   │       └── parent_provider.dart
│   │   ├── search/
│   │   │   ├── data/
│   │   │   │   └── search_repository.dart
│   │   │   └── providers/
│   │   │       └── search_provider.dart
│   │   ├── locations/
│   │   │   ├── data/
│   │   │   │   └── locations_repository.dart
│   │   │   └── providers/
│   │   │       └── locations_provider.dart
│   │   ├── parents/           # (empty - reserved)
│   │   └── teachers/          # (empty - reserved)
│   ├── l10n/                  # Arabic translations
│   ├── app.dart
│   └── main.dart
├── pubspec.yaml
└── README.md
```

---

## Screens & Features

### Authentication (4 screens)
| Screen | File | Description |
|--------|------|-------------|
| Login | `login_screen.dart` | Phone + Password, social login buttons |
| User Type Selection | `user_type_selection_screen.dart` | Parent/Teacher selection |
| Parent Registration | `parent_register_screen.dart` | Full parent registration form |
| Teacher Registration | `teacher_register_screen.dart` | Full teacher registration form |

### Home Screens (2 screens)
| Screen | File | Description |
|--------|------|-------------|
| Parent Home | `parent_home_screen.dart` | Search, nearby teachers, categories |
| Teacher Home | `teacher_home_screen.dart` | Dashboard with stats, recent requests |

### Teacher Features (3 screens)
| Screen | File | Description |
|--------|------|-------------|
| Profile View | `teacher_profile_view_screen.dart` | View teacher profile (for parents) |
| Profile Edit | `teacher_profile_edit_screen.dart` | Edit own profile |
| Subjects Management | `teacher_subjects_screen.dart` | Add/edit subjects with pricing |

### Parent Features (5 screens)
| Screen | File | Description |
|--------|------|-------------|
| Profile Edit | `parent_profile_edit_screen.dart` | Edit parent profile |
| Location Edit | `parent_location_edit_screen.dart` | Set/update location |
| Children Management | `parent_children_manage_screen.dart` | Add/edit children |
| My Requests | `parent_requests_screen.dart` | View tutor requests |
| Request Details | `request_details_screen.dart` | Single request view |

---

## Routes (17 routes)

```dart
// Auth Routes
/login
/register
/register/teacher
/register/parent

// Teacher Routes
/teacher/home
/teacher/profile/edit
/teacher/subjects
/teacher/:id              // View teacher profile

// Parent Routes
/parent/home
/parent/profile/edit
/parent/location/edit
/parent/children
/parent/requests
/parent/requests/:id
```

---

## State Management (Riverpod)

### Providers Implemented
```dart
// Auth
authProvider              // AuthState (user, token, isAuthenticated)
authRepositoryProvider    // AuthRepository

// Teachers
teacherProvider           // Teacher operations
teacherRepositoryProvider // TeacherRepository

// Parents
parentProvider            // Parent operations
parentRepositoryProvider  // ParentRepository

// Search
searchProvider            // Search results
searchRepositoryProvider  // SearchRepository

// Locations
locationsProvider         // Governorates, cities, areas
locationsRepositoryProvider // LocationsRepository
```

---

## API Integration

### DioClient
- Base URL from environment
- Request interceptor: Add JWT token
- Response interceptor: Handle 401
- Timeouts: 30 seconds

### Endpoints Used
- `/auth/login`
- `/auth/register/parent`
- `/auth/register/teacher`
- `/auth/profile`
- `/teachers` (search)
- `/teachers/:id`
- `/teachers/profile`
- `/teachers/subjects`
- `/parents/profile`
- `/parents/children`
- `/favorites`
- `/contact-requests`
- `/tutor-requests`
- `/locations/governorates`
- `/locations/cities/:id`
- `/locations/areas/:id`

---

## Design System

### Colors
```dart
primary: #4873F7    // Royal Blue
secondary: #FF9900  // Orange
background: #F9FAFC
surface: #FFFFFF
textPrimary: #1F2937
textSecondary: #9CA3AF
```

### Typography
- Font: Cairo (Google Fonts)
- Headlines: Bold
- Body: Regular
- Full Arabic RTL support

### Components
- Rounded inputs (16px radius)
- Large primary buttons
- Card-based layouts
- Bottom navigation

---

## Localization

- Primary language: Arabic (RTL)
- All UI strings in Arabic
- Date/time in Arabic format (ar-EG)
- Number formatting (٠١٢٣...)

---

## Tasks Checklist

### ✅ Core Setup
- [x] Project setup
- [x] Install dependencies
- [x] Core setup (Theme, Colors)
- [x] Dio Client with interceptors
- [x] GoRouter setup (17 routes)
- [x] App theme & colors

### ✅ Authentication
- [x] Auth Repository
- [x] Auth Provider
- [x] Login Screen UI
- [x] User Type Selection Screen
- [x] Parent Register Screen
- [x] Teacher Register Screen

### ✅ Home Screens
- [x] Parent Home Screen (with search)
- [x] Teacher Home Screen (dashboard)

### ✅ Teacher Features
- [x] Teacher Repository
- [x] Teacher Provider
- [x] Teacher Profile View Screen
- [x] Teacher Profile Edit Screen
- [x] Teacher Subjects Screen

### ✅ Parent Features
- [x] Parent Repository
- [x] Parent Provider
- [x] Parent Profile Edit Screen
- [x] Parent Location Edit Screen
- [x] Parent Children Management Screen
- [x] Parent Requests Screen
- [x] Request Details Screen

### ✅ Search & Locations
- [x] Search Repository
- [x] Search Provider
- [x] Locations Repository
- [x] Locations Provider

### ⏳ Pending
- [ ] Onboarding screens (3 slides)
- [ ] Favorites feature UI
- [ ] Settings screen
- [ ] Notifications screen
- [ ] Push notifications integration
- [ ] Google Maps integration
- [ ] App icon & splash screen
- [ ] Build for iOS
- [ ] Build for Android
- [ ] Deploy to stores

---

## Running Locally

```bash
# Install dependencies
flutter pub get

# Run on iOS simulator
flutter run -d ios

# Run on Android emulator
flutter run -d android

# For Android, change API URL to 10.0.2.2 for localhost
```

---

## Build Commands

```bash
# Build APK
flutter build apk --release

# Build iOS
flutter build ios --release

# Build App Bundle (Play Store)
flutter build appbundle --release
```

---

## Environment Configuration

For different environments (dev/prod), use:
- `--dart-define=API_URL=https://api.zads.app`

Or create separate `main_dev.dart` and `main_prod.dart` entry points.

---

## File Size Summary

| Feature | Files | Total Size |
|---------|-------|------------|
| Auth | 6 files | ~60 KB |
| Home | 2 files | ~33 KB |
| Teacher | 5 files | ~77 KB |
| Parent | 7 files | ~108 KB |
| Search | 2 files | ~5 KB |
| Locations | 2 files | ~5 KB |
| Core | 5 files | ~15 KB |
| **Total** | **30 files** | **~300 KB** |

---

*Development paused: February 7, 2026*
