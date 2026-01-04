# Zads Platform - Pending Features Checklist

What's left to complete before launch.

**Last Updated:** January 4, 2026

---

## 📊 Summary

| App | Complete | Pending | Priority Items |
|-----|----------|---------|----------------|
| **zads-api** | 85% | 3 items | Image upload |
| **zads-dashboard** | 80% | 4 items | Tutor requests page |
| **zads_app** | 75% | 10 items | Onboarding, favorites |

---

## 🔵 zads-api (Backend)

### High Priority
- [ ] **Image Upload Service**
  - Teacher profile photos
  - Options: Cloudinary, AWS S3, or local storage
  - Endpoints: `POST /api/upload/image`

### Medium Priority
- [ ] **Push Notification Service**
  - Firebase Cloud Messaging (FCM) integration
  - Notification for new contact requests
  - Notification for tutor request responses

### Low Priority (Post-Launch)
- [ ] **Production Deployment**
  - See `DEPLOYMENT_CHECKLIST.md`

---

## 🟢 zads-dashboard (Admin Panel)

### Medium Priority
- [ ] **Tutor Requests Management Page**
  - List all tutor requests from parents
  - Filter by status, subject, stage
  - View request details

- [ ] **User Detail Modals**
  - Click on teacher → show full profile modal
  - Click on parent → show full profile modal
  - Include children info for parents

- [ ] **Dashboard Charts/Graphs**
  - Weekly signups chart
  - Contact requests trend
  - Popular subjects pie chart

### Low Priority (Post-Launch)
- [ ] **Production Deployment**
  - See `DEPLOYMENT_CHECKLIST.md`

---

## 🟡 zads_app (Mobile App)

### High Priority - Core Features
- [ ] **Onboarding Screens** (3 slides)
  - Welcome illustration + Arabic text
  - Features overview
  - Get started button
  - Skip option
  - Store onboarding completed in SharedPreferences

- [ ] **Favorites Feature UI**
  - Heart icon on teacher cards
  - Favorites list screen
  - Add/remove favorites API connected
  - Empty state when no favorites

- [ ] **Teacher Search Results Screen**
  - List view of search results
  - Filter chips (subject, stage, price range)
  - Sort options (rating, price, distance)
  - Map view toggle (optional)

### Medium Priority - User Experience
- [ ] **Settings Screen**
  - Language toggle (Arabic/English)
  - Notification preferences
  - Account settings
  - Logout button
  - App version display

- [ ] **Notifications Screen**
  - List of notifications
  - Read/unread states
  - Link to relevant screens
  - Empty state

- [ ] **Contact Request Flow** (Parent → Teacher)
  - Contact button on teacher profile
  - Confirmation dialog
  - Success/error feedback
  - View sent requests

### Medium Priority - Polish
- [ ] **App Icon & Splash Screen**
  - Design app icon (iOS + Android sizes)
  - Splash screen with logo
  - Update `pubspec.yaml` assets

- [ ] **Google Maps Integration**
  - Show teacher location on map
  - Nearby teachers map view
  - Get API key and configure

### Low Priority - Store Submission
- [ ] **Build for iOS**
  - Configure signing
  - Test on physical device
  - Archive and upload

- [ ] **Build for Android**
  - Generate keystore
  - Build release APK/AAB
  - Test on physical device

---

## 🎯 Recommended Implementation Order

### Sprint 1 (Week 1) - Core Mobile Features
| # | Task | App | Effort |
|---|------|-----|--------|
| 1 | Onboarding screens | Mobile | 4 hrs |
| 2 | Favorites feature UI | Mobile | 4 hrs |
| 3 | Teacher search results | Mobile | 6 hrs |
| 4 | Contact request flow | Mobile | 4 hrs |

### Sprint 2 (Week 2) - Polish & Dashboard
| # | Task | App | Effort |
|---|------|-----|--------|
| 5 | Settings screen | Mobile | 3 hrs |
| 6 | Tutor requests page | Dashboard | 4 hrs |
| 7 | App icon & splash | Mobile | 2 hrs |
| 8 | User detail modals | Dashboard | 4 hrs |

### Sprint 3 (Week 3) - Infrastructure
| # | Task | App | Effort |
|---|------|-----|--------|
| 9 | Image upload service | API | 6 hrs |
| 10 | Push notifications | API + Mobile | 8 hrs |
| 11 | Google Maps | Mobile | 4 hrs |
| 12 | Dashboard charts | Dashboard | 4 hrs |

### Sprint 4 (Week 4) - Deployment
| # | Task | App | Effort |
|---|------|-----|--------|
| 13 | Deploy API | API | 4 hrs |
| 14 | Deploy Dashboard | Dashboard | 2 hrs |
| 15 | Build & test Android | Mobile | 4 hrs |
| 16 | Build & test iOS | Mobile | 4 hrs |
| 17 | Submit to stores | Mobile | 4 hrs |

---

## ⚡ Quick Wins (< 2 hours each)

Easy items to complete quickly:

- [ ] App icon design and integration
- [ ] Splash screen setup
- [ ] Settings screen (basic)
- [ ] Notifications screen (UI only)
- [ ] Dashboard charts (using Vuetify)

---

## 🚫 Not Required for MVP

These can wait until after launch:

- Online video lessons
- In-app messaging/chat
- Payment integration
- Reviews and ratings system
- Advanced analytics
- Multi-language support (English)

---

## 📝 Notes

### Mobile App Screens Status

| Screen | Status | Notes |
|--------|--------|-------|
| Login | ✅ Done | |
| Register (Parent) | ✅ Done | |
| Register (Teacher) | ✅ Done | |
| Parent Home | ✅ Done | |
| Teacher Home | ✅ Done | |
| Teacher Profile View | ✅ Done | |
| Teacher Profile Edit | ✅ Done | |
| Teacher Subjects | ✅ Done | |
| Parent Profile Edit | ✅ Done | |
| Parent Location Edit | ✅ Done | |
| Parent Children | ✅ Done | |
| Parent Requests | ✅ Done | |
| Request Details | ✅ Done | |
| **Onboarding** | ❌ Missing | High priority |
| **Favorites** | ❌ Missing | High priority |
| **Search Results** | ❌ Missing | High priority |
| **Settings** | ❌ Missing | Medium priority |
| **Notifications** | ❌ Missing | Medium priority |

### API Endpoints Status

| Endpoint | Status |
|----------|--------|
| Auth (login, register) | ✅ |
| Teachers (CRUD, search) | ✅ |
| Parents (CRUD, children) | ✅ |
| Subjects/Stages | ✅ |
| Favorites | ✅ |
| Contact Requests | ✅ |
| Tutor Requests | ✅ |
| Locations | ✅ |
| Admin Dashboard | ✅ |
| **Image Upload** | ❌ Missing |
| **Push Notifications** | ❌ Missing |

---

*Estimated total remaining effort: ~60 hours*
