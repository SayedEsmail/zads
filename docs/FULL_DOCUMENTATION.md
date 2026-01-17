# Zads (زاد) - Full Platform Documentation

> **زادك للتعليم** (Your Provisions for Learning)  
> Egyptian marketplace connecting parents with private tutors

**Domain:** [zads.app](https://zads.app)  
**Last Updated:** January 17, 2026

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Architecture](#2-architecture)
3. [User Types & Roles](#3-user-types--roles)
4. [Core Features](#4-core-features)
5. [API Reference](#5-api-reference)
6. [Database Schema](#6-database-schema)
7. [Mobile App (Flutter)](#7-mobile-app-flutter)
8. [Admin Dashboard (Vue)](#8-admin-dashboard-vue)
9. [Business Model](#9-business-model)
10. [Deployment](#10-deployment)

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

```
┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │     │    Dashboard    │
│   (Flutter)     │     │    (Vue 3)      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
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

| Project | Tech Stack | Purpose |
|---------|-----------|---------|
| **zads-api** | Node.js, Express, Prisma, PostgreSQL | Backend REST API |
| **zads-dashboard** | Vue 3, Vuetify 3, Vite, Pinia | Admin Dashboard (Arabic RTL) |
| **zads_app** | Flutter, Riverpod, Dio, GoRouter | Mobile App (iOS & Android) |

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

## 7. Mobile App (Flutter)

### 7.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Flutter 3.10+ |
| State Management | Riverpod 3 |
| HTTP Client | Dio |
| Routing | GoRouter |
| Storage | SharedPreferences |
| Fonts | Cairo (Google Fonts) |

### 7.2 App Screens

#### Authentication (4 screens)
- Login Screen
- User Type Selection (Parent/Teacher)
- Parent Registration
- Teacher Registration

#### Home Screens (2 screens)
- Parent Home (search, nearby teachers, categories)
- Teacher Home (dashboard with stats)

#### Teacher Features (3 screens)
- Profile View (for parents viewing)
- Profile Edit
- Subjects Management

#### Parent Features (5 screens)
- Profile Edit
- Location Edit
- Children Management
- My Requests (tutor + contact requests)
- Request Details

### 7.3 Design System

```dart
// Colors
primary: #4873F7    // Royal Blue
secondary: #FF9900  // Orange
background: #F9FAFC
textPrimary: #1F2937
textSecondary: #9CA3AF

// Typography
Font: Cairo (Arabic RTL support)
```

---

## 8. Admin Dashboard (Vue)

### 8.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vue 3 (Composition API) |
| UI Library | Vuetify 3 |
| State | Pinia |
| HTTP | Axios |
| Build | Vite |
| Template | Vuexy Starter Kit |

### 8.2 Pages

| Page | Route | Features |
|------|-------|----------|
| Dashboard | `/` | Statistics cards, quick actions |
| Login | `/login` | Phone/password auth |
| Teachers | `/teachers` | Data table, search, status management |
| Parents | `/parents` | Data table, search, status management |
| Subjects | `/subjects` | CRUD operations |
| Stages | `/stages` | CRUD operations |
| Contact Requests | `/contact-requests` | List all requests |

### 8.3 Navigation (Sidebar)

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

## 9. Business Model

### Revenue Streams (Future)

1. **Featured Listings** - Teachers pay to appear at top of search
2. **Subscription Plans** - Monthly plans for teachers (more visibility, badges)
3. **Commission** - On lessons booked through platform

### MVP Strategy
- Free registration for all users
- Basic listing is free for teachers
- Premium features available later

---

## 10. Deployment

### 10.1 Server Requirements

**API Server:**
- Node.js 18+
- PostgreSQL 14+
- PM2 (process manager)
- Nginx (reverse proxy)
- 2GB RAM minimum

**Dashboard Server:**
- Nginx (static files)
- SSL certificates

### 10.2 DNS Configuration

| Subdomain | Purpose |
|-----------|---------|
| `zads.app` | Landing/Dashboard |
| `api.zads.app` | API Server |
| `admin.zads.app` | Admin Dashboard (optional) |

### 10.3 Environment Variables

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

### 10.4 Default Credentials (After Seeding)

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

### 2. Start the Dashboard
```bash
cd zads-dashboard
pnpm install
cp .env.example .env
pnpm dev
```

### 3. Run the Mobile App
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
| App Downloads | 100 |

---

*Documentation generated from codebase analysis - January 17, 2026*
