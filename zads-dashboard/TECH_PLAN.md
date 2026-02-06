# Zads Dashboard - Technical Plan

## Overview
Admin dashboard for managing the Zads platform. Built with Vue 3 and Vuetify 3 using the Vuexy starter kit.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vue 3 (Composition API) |
| UI Library | Vuetify 3 |
| State Management | Pinia |
| HTTP Client | Axios |
| Router | Vue Router |
| Build Tool | Vite |
| Template | Vuexy Starter Kit |
| Icons | Tabler Icons |

---

## Project Structure

```
zads-dashboard/
├── src/
│   ├── @core/             # Vuexy core components
│   ├── @layouts/          # Layout system
│   ├── assets/
│   │   └── images/
│   │       └── logo.png
│   ├── components/
│   │   └── dialogs/       # Reusable dialogs
│   ├── composables/       # Vue composables
│   ├── layouts/
│   │   ├── blank.vue      # Auth layout
│   │   └── default.vue    # Main layout
│   ├── navigation/
│   │   └── vertical/
│   │       └── index.js   # Sidebar navigation
│   ├── pages/
│   │   ├── index.vue           # Dashboard
│   │   ├── login.vue           # Login
│   │   ├── teachers.vue        # Teachers list
│   │   ├── parents.vue         # Parents list
│   │   ├── subjects.vue        # Subjects CRUD
│   │   ├── stages.vue          # Stages CRUD
│   │   ├── contact-requests.vue # Contact requests
│   │   └── [...error].vue      # Error page
│   ├── plugins/
│   │   ├── vuetify/       # Vuetify config
│   │   └── router/        # Vue Router config
│   ├── services/
│   │   └── api.js         # Axios instance
│   ├── stores/
│   │   └── auth.js        # Auth Pinia store
│   ├── utils/             # Utility functions
│   ├── views/             # Additional views
│   ├── App.vue
│   └── main.js
├── themeConfig.js         # RTL/Arabic config
├── .env.example
└── package.json
```

---

## Pages & Features

### Dashboard (index.vue)
- Statistics cards (teachers, parents, requests)
- Quick action buttons
- Useful links

### Login (login.vue)
- Phone/password authentication
- Arabic RTL interface
- JWT token storage
- Redirect on success

### Teachers Management (teachers.vue)
- Data table with server-side pagination
- Search by name/phone
- Filter by status
- Actions: view details, suspend/activate

### Parents Management (parents.vue)
- Data table with server-side pagination
- Search functionality
- Status management

### Subjects (subjects.vue)
- CRUD operations
- Add/Edit dialog
- Activate/Deactivate toggle
- Arabic subject names

### Stages (stages.vue)
- CRUD operations
- Add/Edit dialog
- Activate/Deactivate toggle
- Sort order management

### Contact Requests (contact-requests.vue)
- List all contact requests
- View parent/teacher details
- Status display (pending, accepted, rejected)
- Date formatting

---

## Navigation Structure

```javascript
[
  { title: 'لوحة التحكم', to: '/', icon: 'tabler-dashboard' },
  { heading: 'الإدارة' },
  { title: 'المدرسين', to: '/teachers', icon: 'tabler-users' },
  { title: 'أولياء الأمور', to: '/parents', icon: 'tabler-user-heart' },
  { title: 'طلبات التواصل', to: '/contact-requests', icon: 'tabler-messages' },
  { heading: 'الإعدادات' },
  { title: 'المواد الدراسية', to: '/subjects', icon: 'tabler-book' },
  { title: 'المراحل التعليمية', to: '/stages', icon: 'tabler-school' },
]
```

---

## API Service (services/api.js)

- Axios instance with baseURL from env
- Request interceptor: Add JWT token from localStorage
- Response interceptor: Handle 401 (redirect to login)
- 30 second timeout
- Automatic error message extraction

---

## Auth Store (stores/auth.js)

- **State:** user, token, loading, error
- **Actions:** login, logout, getProfile
- **Persistence:** localStorage (token, user)

---

## Configuration

### themeConfig.js
- App title: "زاد"
- Default locale: 'ar'
- RTL enabled
- Arabic language config

### .env.example
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Tasks Checklist

### ✅ Completed
- [x] Cleanup demo files
- [x] Configure RTL Arabic
- [x] Setup API service (Axios with interceptors)
- [x] Create Auth store (Pinia)
- [x] Update navigation (Arabic)
- [x] Dashboard page with stats
- [x] Login page
- [x] Teachers management (list, search, status)
- [x] Parents management (list, search, status)
- [x] Subjects CRUD
- [x] Stages CRUD
- [x] Contact requests view
- [x] Error page (404)

### ⏳ Pending
- [ ] Deploy to production
- [ ] Add charts/graphs to dashboard
- [ ] Add user detail modals
- [ ] Tutor requests management page

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

Dashboard: `http://localhost:5173`

---

## Build for Production

```bash
# Build
pnpm build

# Preview build
pnpm preview
```

---

## Design Notes

- All UI text in Arabic
- RTL layout throughout
- Consistent with Vuexy design system
- Tabler icons for navigation
- Vuetify 3 components only

---

*Last Updated: February 7, 2026*
