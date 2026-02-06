# Zads Web - Technical Plan ⭐ ACTIVE

> **Primary Focus for Phase 1** - Web-first approach for faster parent & teacher acquisition.

## Overview
Web application for the Zads platform, built with Nuxt 3 and Vuetify 3 using the **Vuexy Starter Kit**. This is the main client-facing application for parents and teachers.

> **Template:** [Vuexy Admin v10.4.0](file:///Users/sayed/Devs/BC/vuexy-admin-v10.4.0/nuxt-version/javascript-version/full-version) - Nuxt/JavaScript Full Version

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Nuxt 3 |
| UI Library | Vuetify 3 |
| Template | Vuexy Admin v10.4.0 |
| State Management | Pinia |
| HTTP Client | ofetch |
| Authentication | @sidebase/nuxt-auth |
| i18n | @nuxtjs/i18n |
| Build Tool | Vite |
| Icons | Tabler Icons, MDI |

---

## Project Structure

```
zads_web/
├── @core/                 # Core components & utilities
├── @layouts/              # Layout system
├── assets/
│   └── styles/            # Global SCSS
├── components/
│   ├── auth/              # Auth components
│   ├── parent/            # Parent-specific components
│   ├── teacher/           # Teacher-specific components
│   └── shared/            # Shared components
├── composables/
│   ├── useAuth.js         # Auth composable
│   ├── useApi.js          # API composable
│   └── useLocations.js    # Locations composable
├── layouts/
│   ├── blank.vue          # Auth layout (no sidebar)
│   ├── default.vue        # Main layout
│   └── public.vue         # Public pages layout
├── middleware/
│   └── auth.js            # Auth middleware
├── pages/
│   ├── index.vue          # Landing page
│   ├── login.vue          # Login
│   ├── register.vue       # Registration
│   ├── forgot-password.vue
│   ├── parent/            # Parent pages
│   │   ├── index.vue      # Parent home
│   │   ├── search.vue     # Search teachers
│   │   ├── children.vue   # Manage children
│   │   ├── requests.vue   # My requests
│   │   └── favorites.vue  # Favorites
│   ├── teacher/           # Teacher pages
│   │   ├── index.vue      # Teacher dashboard
│   │   ├── profile.vue    # Edit profile
│   │   ├── subjects.vue   # Manage subjects
│   │   └── requests.vue   # View requests
│   └── teachers/
│       └── [id].vue       # Teacher profile view
├── plugins/
│   ├── vuetify/           # Vuetify config
│   └── i18n/              # i18n setup
├── stores/
│   ├── auth.js            # Auth store
│   ├── parent.js          # Parent store
│   ├── teacher.js         # Teacher store
│   └── locations.js       # Locations store
├── utils/
│   └── api.js             # API utilities
├── nuxt.config.ts
└── app.vue
```

---

## Pages & Features

### Public Pages
| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, features, CTA |
| About | `/about` | About Zads |
| How It Works | `/how-it-works` | Steps for parents/teachers |

### Authentication
| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Phone + Password |
| Register | `/register` | User type selection |
| Parent Register | `/register/parent` | Full parent form |
| Teacher Register | `/register/teacher` | Full teacher form |
| Forgot Password | `/forgot-password` | Password reset |

### Parent Features
| Page | Route | Description |
|------|-------|-------------|
| Home | `/parent` | Dashboard, search, categories |
| Search | `/parent/search` | Search with filters |
| Teacher View | `/teachers/:id` | View teacher profile |
| Children | `/parent/children` | Manage children |
| Requests | `/parent/requests` | Tutor + contact requests |
| Favorites | `/parent/favorites` | Saved teachers |
| Profile | `/parent/profile` | Edit profile |

### Teacher Features
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/teacher` | Stats, recent requests |
| Profile | `/teacher/profile` | Edit profile |
| Subjects | `/teacher/subjects` | Manage subjects & pricing |
| Requests | `/teacher/requests` | Incoming requests |
| Browse | `/teacher/browse` | Browse tutor requests |

---

## Routes Structure

```javascript
// Public Routes
/
/about
/how-it-works
/login
/register
/register/parent
/register/teacher
/forgot-password

// Parent Routes (Protected)
/parent
/parent/search
/parent/children
/parent/requests
/parent/favorites
/parent/profile

// Teacher Routes (Protected)
/teacher
/teacher/profile
/teacher/subjects
/teacher/requests
/teacher/browse

// Shared Routes
/teachers/:id         // View any teacher profile
```

---

## State Management (Pinia)

### Stores to Implement
```javascript
// Auth Store
authStore {
  state: { user, token, isAuthenticated }
  actions: { login, logout, register, getProfile }
}

// Parent Store
parentStore {
  state: { children, requests, favorites }
  actions: { getChildren, addChild, updateChild, deleteChild }
}

// Teacher Store
teacherStore {
  state: { profile, subjects, stats, requests }
  actions: { getProfile, updateProfile, manageSubjects }
}

// Locations Store
locationsStore {
  state: { governorates, cities, areas }
  actions: { getGovernorates, getCities, getAreas }
}

// Search Store
searchStore {
  state: { results, filters, pagination }
  actions: { searchTeachers, setFilters, loadMore }
}
```

---

## API Integration

### API Client (composables/useApi.js)
- Base URL from environment
- Request interceptor: Add JWT token
- Response interceptor: Handle 401
- Error handling with snackbar notifications

### Endpoints Used
```
// Auth
POST /api/auth/login
POST /api/auth/register/parent
POST /api/auth/register/teacher
GET  /api/auth/profile

// Teachers
GET  /api/teachers              (search)
GET  /api/teachers/:id
PUT  /api/teachers/profile
POST /api/teachers/subjects
GET  /api/teachers/stats

// Parents
GET  /api/parents/profile
PUT  /api/parents/profile
GET  /api/parents/children
POST /api/parents/children
PUT  /api/parents/children/:id
DELETE /api/parents/children/:id

// Favorites
GET    /api/favorites
POST   /api/favorites/:teacherId
DELETE /api/favorites/:teacherId

// Contact Requests
POST  /api/contact-requests
GET   /api/contact-requests/incoming
GET   /api/contact-requests/outgoing
PATCH /api/contact-requests/:id/status

// Tutor Requests
POST  /api/tutor-requests
GET   /api/tutor-requests
GET   /api/tutor-requests/my

// Locations
GET /api/locations/governorates
GET /api/locations/cities/:id
GET /api/locations/areas/:id
```

---

## Design System

### Colors
```scss
$primary: #4873F7;    // Royal Blue
$secondary: #FF9900;  // Orange
$background: #F9FAFC;
$surface: #FFFFFF;
$text-primary: #1F2937;
$text-secondary: #9CA3AF;
```

### Typography
- Font: Cairo (Arabic support)
- Headlines: Bold
- Body: Regular
- Full Arabic RTL support

### Components
- Vuetify 3 components
- Rounded inputs (16px radius)
- Card-based layouts
- Bottom navigation (mobile)
- Sidebar navigation (desktop)

---

## Localization

- Primary language: Arabic (RTL)
- All UI strings in Arabic
- Date/time in Arabic format (ar-EG)
- vue-i18n for translations

---

## Tasks Checklist

### ✅ Core Setup
- [x] Project setup (Nuxt 3)
- [x] Vuetify 3 configuration
- [x] RTL/Arabic setup
- [x] Pinia stores setup
- [x] i18n configuration

### 🔄 Authentication (In Progress)
- [x] Login page UI
- [x] Register page UI
- [ ] Auth store implementation
- [ ] JWT token handling
- [ ] Protected routes middleware

### ⏳ Parent Features
- [ ] Parent home page
- [ ] Teacher search with filters
- [ ] Teacher profile view
- [ ] Children management
- [ ] Contact requests
- [ ] Favorites

### ⏳ Teacher Features
- [ ] Teacher dashboard
- [ ] Profile edit
- [ ] Subjects management
- [ ] Incoming requests view
- [ ] Browse tutor requests

### ⏳ Public Pages
- [ ] Landing page
- [ ] About page
- [ ] How it works page

### ⏳ Deployment
- [ ] Environment configuration
- [ ] Build optimization
- [ ] Deploy to production

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Create env file
cp .env.example .env

# Start dev server
pnpm dev
```

Web App: `http://localhost:3001`

---

## Build for Production

```bash
# Build
pnpm build

# Preview build
pnpm preview

# Generate static
pnpm generate
```

---

## Environment Variables

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

---

## Design Notes

- All UI text in Arabic
- RTL layout throughout
- Consistent with mobile app design
- Responsive (mobile-first)
- Vuetify 3 components only

---

*Last Updated: February 7, 2026*
