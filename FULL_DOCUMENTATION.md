# Zads (زاد) - Full Platform Documentation

> **زادك للتعليم** (Your Provisions for Learning)  
> Egyptian marketplace connecting parents with private tutors

**Domain:** [zads.app](https://zads.app)  
**Last Updated:** February 7, 2026

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Architecture](#2-architecture)
3. [User Types & Roles](#3-user-types--roles)
4. [Core Features](#4-core-features)
5. [API Reference](#5-api-reference)
6. [Database Schema](#6-database-schema)
7. [Web App (Nuxt 3)](#7-web-app-nuxt-3--active) ⭐ Active
8. [Mobile App (Flutter)](#8-mobile-app-flutter--paused) ⏸️ Paused
9. [Admin Dashboard (Vue)](#9-admin-dashboard-vue)
10. [Business Model](#10-business-model)
11. [Deployment](#11-deployment)

---

## 1. Platform Overview

### Problem Statement

Egyptian parents struggle to find qualified home tutors. Current methods (word-of-mouth, Facebook groups) are inefficient, unsafe, and time-consuming. Teachers lack a professional platform to showcase their qualifications and reach potential students.

### Solution

Zads is a **marketplace platform** that:
- Allows **parents** to find and contact qualified teachers
- Allows **teachers** to create professional profiles and receive student requests
- Provides **admin tools** for platform management

---

## 2. Architecture

> **📱 Phase 1 Strategy (Current):** Web-first approach for faster user acquisition. No app installation required.
> Mobile app development is **paused** until web platform gains traction.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Web App      │     │    Dashboard    │     │   Mobile App    │
│   (Nuxt 3)      │     │    (Vue 3)      │     │   (Flutter)     │
│   ⭐ ACTIVE     │     │   ⭐ ACTIVE     │     │   ⏸️ PAUSED      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                          ┌──────▼──────┐
                          │   REST API  │
                          │  (Express)  │
                          └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │  PostgreSQL │
                          └─────────────┘
```

### Projects

| Project | Tech Stack | Purpose | Status |
|---------|-----------|---------|--------|
| **zads_web** | Nuxt 3, Vuetify 3, Pinia, i18n | Web App for Parents & Teachers | ⭐ **Active** |
| **zads-api** | Node.js, Express, Prisma, PostgreSQL | Backend REST API | ⭐ **Active** |
| **zads-dashboard** | Vue 3, Vuetify 3, Vite, Pinia | Admin Dashboard (Arabic RTL) | ⭐ **Active** |
| **zads_app** | Flutter, Riverpod, Dio, GoRouter | Mobile App (iOS & Android) | ⏸️ **Paused** |

### Why Web-First?
1. **Faster acquisition** - Users can access immediately without app store downloads
2. **Lower friction** - Share links easily via WhatsApp/Facebook
3. **SEO benefits** - Search engine visibility from day one
4. **Easier iteration** - Update features without app store review process

---

## 3. User Types & Roles

| User Type | الوصف | Capabilities |
|-----------|-------|--------------|
| **Parent (ولي أمر)** | Looking for home tutors for children (K-12) | Search teachers, send contact requests, save favorites, post tutor requests |
| **Teacher (معلم)** | Offering private tutoring services | Create profile, set subjects & pricing, receive requests, view statistics |
| **Admin (مدير)** | Platform managers and support staff | Dashboard access, user management, content moderation |

---

## 4. Core Features

### 4.1 Parent Features

#### 4.1.1 Child Management
Parents can add children with their educational information:

```
Add Child Flow:
├── Name (اسم الطفل)
├── Stage (المرحلة التعليمية) - e.g., ثانوية عامة
└── Subjects (المواد الدراسية) - e.g., [رياضيات, فيزياء]
```

**Auto Tutor Request Creation:**  
When a parent adds a child with subjects, **tutor requests are automatically created** for each subject:

```
Parent adds child "أحمد"
    ├── Stage: الثانوية العامة
    ├── Subjects: [رياضيات, فيزياء, كيمياء]
    │
    └── AUTO-CREATES 3 Tutor Requests:
        ├── "طلب معلم لـ أحمد" - رياضيات
        ├── "طلب معلم لـ أحمد" - فيزياء
        └── "طلب معلم لـ أحمد" - كيمياء
```

#### 4.1.2 Teacher Search
- Browse/search teachers by location, subject, stage
- View teacher profiles with ratings and pricing
- Save favorite teachers for comparison
- Filter by price range, lesson type, location

#### 4.1.3 Contact Requests
- Send contact requests to teachers
- View outgoing request status (pending/accepted/rejected)
- When accepted, view teacher's phone number

#### 4.1.4 Tutor Requests
- View auto-generated tutor requests
- Manage request status (active/closed)
- See interested teachers count

---

### 4.2 Teacher Features

#### 4.2.1 Profile Management
```
Teacher Profile:
├── Basic Info (name, phone, avatar)
├── Bio (نبذة شخصية)
├── Experience Years (سنوات الخبرة)
├── Qualification (المؤهل)
├── Location (Governorate → City → Area)
├── Lesson Types (at_teacher, at_student, group)
└── Verification Status (موثق)
```

#### 4.2.2 Subject & Pricing Management
Teachers can set subjects with flexible pricing:

```
TeacherSubject:
├── Subject (المادة)
├── Stage (المرحلة)
├── Prices:
│   ├── At Teacher's Place (سعر عند المعلم)
│   ├── At Student's Home (سعر عند الطالب)
│   └── Group Lessons (سعر المجموعات)
├── Duration (مدة الحصة)
└── Negotiable (قابل للتفاوض)
```

#### 4.2.3 Contact Requests
- Receive contact requests from parents
- Accept or reject requests
- View parent details upon acceptance

#### 4.2.4 Dashboard Stats
- Profile views count
- Contact requests received
- Average rating

---

### 4.3 Admin Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Platform statistics (users, requests, etc.) |
| **Teachers Management** | List, suspend, activate teachers |
| **Parents Management** | List, view parent profiles |
| **Subjects CRUD** | Add/edit educational subjects |
| **Stages CRUD** | Add/edit educational stages |
| **Contact Requests** | View all contact requests |
| **Tutor Requests** | Browse parent tutor requests |

---

## 5. API Reference

**Base URL:** `http://localhost:3000/api` (dev) | `https://api.zads.app/api` (prod)

### 5.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register/teacher` | Register new teacher |
| `POST` | `/auth/register/parent` | Register new parent |
| `POST` | `/auth/login` | Login (returns JWT) |
| `GET` | `/auth/profile` | Get current user profile |

### 5.2 Teachers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/teachers` | Search teachers (with filters) |
| `GET` | `/teachers/:id` | Get teacher details |
| `PUT` | `/teachers/profile` | Update own profile |
| `POST` | `/teachers/subjects` | Add/update subjects |
| `GET` | `/teachers/stats` | Get profile stats |

### 5.3 Parents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/parents/profile` | Get my profile |
| `PUT` | `/parents/profile` | Update profile |
| `GET` | `/parents/children` | Get children list |
| `POST` | `/parents/children` | Add child (auto-creates tutor requests) |
| `PUT` | `/parents/children/:id` | Update child |
| `DELETE` | `/parents/children/:id` | Delete child |

### 5.4 Subjects & Stages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/subjects` | List all subjects |
| `POST` | `/subjects` | Create subject (admin) |
| `PUT` | `/subjects/:id` | Update subject (admin) |
| `GET` | `/stages` | List all stages |
| `POST` | `/stages` | Create stage (admin) |
| `PUT` | `/stages/:id` | Update stage (admin) |

### 5.5 Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/locations/governorates` | List all governorates |
| `GET` | `/locations/cities/:governorateId` | List cities in governorate |
| `GET` | `/locations/areas/:cityId` | List areas in city |

### 5.6 Favorites

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/favorites` | Get favorites list |
| `POST` | `/favorites/:teacherId` | Add to favorites |
| `DELETE` | `/favorites/:teacherId` | Remove from favorites |

### 5.7 Contact Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/contact-requests` | Create request (parent) |
| `GET` | `/contact-requests/incoming` | Get incoming (teacher) |
| `GET` | `/contact-requests/outgoing` | Get outgoing (parent) |
| `PATCH` | `/contact-requests/:id/status` | Update status |

### 5.8 Tutor Requests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/tutor-requests` | Parent | Create manually (optional) |
| `GET` | `/tutor-requests` | Teacher | Browse active requests |
| `GET` | `/tutor-requests/my` | Parent | Get own requests |
| `PUT` | `/tutor-requests/:id` | Parent | Update request |
| `PATCH` | `/tutor-requests/:id/close` | Parent | Close request |
| `DELETE` | `/tutor-requests/:id` | Parent | Delete request |

### 5.9 Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/dashboard` | Get statistics |
| `GET` | `/admin/teachers` | List all teachers |
| `GET` | `/admin/parents` | List all parents |
| `PATCH` | `/admin/users/:id/status` | Update user status |

---

## 6. Database Schema

### 6.1 Core Models

```
User
├── id, phone, email, passwordHash, name
├── avatarUrl, userType, status, fcmToken
└── Relations: Teacher?, Parent?

Teacher
├── id, userId, bio, experienceYears, qualification
├── areaId, lessonTypes, isVerified
├── viewsCount, avgRating, ratingCount
└── Relations: subjects[], favorites[], contactRequests[]

Parent
├── id, userId, areaId
└── Relations: children[], favorites[], contactRequests[], tutorRequests[]

ParentChild
├── id, parentId, name, stageId
└── Relations: subjects[], tutorRequests[]
```

### 6.2 Educational Models

```
Subject
├── id, nameAr, nameEn, icon, isActive, sortOrder

Stage
├── id, nameAr, nameEn, sortOrder, isActive

TeacherSubject (Many-to-Many with pricing)
├── teacherId, subjectId, stageId
├── priceAtTeacher, priceAtStudent, priceGroup
├── durationMinutes, priceNegotiable, isActive
```

### 6.3 Request Models

```
ContactRequest
├── id, parentId, teacherId, subjectId, stageId
├── message, status [pending|accepted|rejected]

TutorRequest (auto-created from children)
├── id, parentId, parentChildId, subjectId, stageId
├── description, preferredLessonType
├── budgetMin, budgetMax, areaId
├── status [active|fulfilled|closed], expiresAt
```

### 6.4 Location Models

```
Governorate → City → Area (Egyptian locations)
├── Governorate (محافظة): الإسكندرية, الجيزة, etc.
├── City (مدينة): الزيتون, المنتزه, etc.
└── Area (منطقة): سيدي بشر, العصافرة, etc.
```

---

## 7. Web App (Nuxt 3) ⭐ ACTIVE

> **Primary focus for Phase 1** - Web-first approach for faster parent & teacher acquisition.

### 7.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Nuxt 3 |
| UI Library | Vuetify 3 |
| Template | Vuexy Admin v10.4.0 |
| State | Pinia |
| HTTP | ofetch |
| i18n | @nuxtjs/i18n |
| Auth | @sidebase/nuxt-auth |
| Build | Vite |

### 7.2 Pages to Implement

#### Public Pages
- Landing Page (زاد الرئيسية)
- About Us (من نحن)
- How It Works (كيف يعمل)

#### Authentication
- Login (تسجيل الدخول)
- Register - User Type Selection
- Register - Parent Form
- Register - Teacher Form
- Forgot Password

#### Parent Features
- Parent Home (search, nearby teachers)
- Teacher Search Results
- Teacher Profile View
- Children Management
- My Requests (tutor + contact)
- Favorites List

#### Teacher Features
- Teacher Dashboard (stats)
- Profile Edit
- Subjects & Pricing Management
- Incoming Requests
- Browse Tutor Requests

### 7.3 Development Status

| Feature | Status |
|---------|--------|
| Project Setup | ✅ Done |
| Authentication | 🔄 In Progress |
| Parent Features | ⏳ Pending |
| Teacher Features | ⏳ Pending |
| Public Pages | ⏳ Pending |

---

## 8. Mobile App (Flutter) ⏸️ PAUSED

> **Development paused** until web platform gains traction. The codebase is ~70% complete and can be resumed for Phase 2.

### 8.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Flutter 3.10+ |
| State Management | Riverpod 3 |
| HTTP Client | Dio |
| Routing | GoRouter |
| Storage | SharedPreferences |
| Fonts | Cairo (Google Fonts) |

### 8.2 Completed Screens (14 screens)
- ✅ Login, User Type Selection, Parent/Teacher Registration
- ✅ Parent Home, Teacher Home
- ✅ Teacher Profile View/Edit, Subjects Management
- ✅ Parent Profile Edit, Location Edit, Children Management
- ✅ Parent Requests Screen, Request Details

### 8.3 Pending Features (for Phase 2)
- Onboarding screens
- Favorites UI
- Settings & Notifications
- Push notifications
- App store deployment

---

## 9. Admin Dashboard (Vue)

### 9.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vue 3 (Composition API) |
| UI Library | Vuetify 3 |
| State | Pinia |
| HTTP | Axios |
| Build | Vite |
| Template | Vuexy Starter Kit |

### 9.2 Pages

| Page | Route | Features |
|------|-------|----------|
| Dashboard | `/` | Statistics cards, quick actions |
| Login | `/login` | Phone/password auth |
| Teachers | `/teachers` | Data table, search, status management |
| Parents | `/parents` | Data table, search, status management |
| Subjects | `/subjects` | CRUD operations |
| Stages | `/stages` | CRUD operations |
| Contact Requests | `/contact-requests` | List all requests |

### 9.3 Navigation (Sidebar)

```
├── لوحة التحكم (Dashboard)
├── الإدارة (Management)
│   ├── المدرسين (Teachers)
│   ├── أولياء الأمور (Parents)
│   └── طلبات التواصل (Contact Requests)
└── الإعدادات (Settings)
    ├── المواد الدراسية (Subjects)
    └── المراحل التعليمية (Stages)
```

---

## 10. Business Model

### Revenue Streams (Future)

1. **Featured Listings** - Teachers pay to appear at top of search
2. **Subscription Plans** - Monthly plans for teachers (more visibility, badges)
3. **Commission** - On lessons booked through platform

### MVP Strategy
- Free registration for all users
- Basic listing is free for teachers
- Premium features available later

---

## 11. Deployment

### 11.1 Server Requirements

**API Server:**
- Node.js 18+
- PostgreSQL 14+
- PM2 (process manager)
- Nginx (reverse proxy)
- 2GB RAM minimum

**Dashboard Server:**
- Nginx (static files)
- SSL certificates

### 11.2 DNS Configuration

| Subdomain | Purpose |
|-----------|---------|
| `zads.app` | Landing/Dashboard |
| `api.zads.app` | API Server |
| `admin.zads.app` | Admin Dashboard (optional) |

### 11.3 Environment Variables

**API (.env):**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/zads
JWT_SECRET=your_64_char_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://zads.app
```

**Dashboard (.env.production):**
```env
VITE_API_BASE_URL=https://api.zads.app/api
```

### 11.4 Default Credentials (After Seeding)

| Role | Phone | Password |
|------|-------|----------|
| Admin | 01000000000 | admin123 |
| Parent | 01222222222 | parent123 |
| Teacher | 01111111111 | teacher123 |

---

## Quick Start

### 1. Start the API
```bash
cd zads-api
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 2. Start the Web App (Primary)
```bash
cd zads_web
pnpm install
cp .env.example .env
pnpm dev
```

### 3. Start the Dashboard
```bash
cd zads-dashboard
pnpm install
cp .env.example .env
pnpm dev
```

### 4. (Optional) Run the Mobile App
> ⏸️ Mobile development is paused for Phase 1
```bash
cd zads_app
flutter pub get
flutter run
```

---

## Success Metrics (First Month)

| Metric | Target |
|--------|--------|
| Registered Teachers | 20 |
| Registered Parents | 50 |
| Contact Requests | 30 |
| Website Visits | 500 |

---

*Documentation generated from codebase analysis - January 17, 2026*
