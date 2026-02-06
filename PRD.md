# Zads - Product Requirements Document (PRD)

## 1. Overview

**Product Name:** Zads (زاد)  
**Domain:** zads.app  
**Tagline:** "زادك للتعليم" (Your Provisions for Learning)

Zads is an Egyptian marketplace platform connecting parents seeking private tutors with qualified teachers. The platform facilitates discovery, comparison, and communication while maintaining a simple, scalable architecture.

---

## 2. Development Strategy

> **📱 Phase 1 (Current):** Web-first approach for faster user acquisition. No app installation required.
> Mobile app development is **paused** until web platform gains traction.

### Why Web-First?
1. **Faster acquisition** - Users can access immediately without app store downloads
2. **Lower friction** - Share links easily via WhatsApp/Facebook
3. **SEO benefits** - Search engine visibility from day one
4. **Easier iteration** - Update features without app store review process

---

## 3. Problem Statement

Egyptian parents struggle to find qualified home tutors. Current methods (word-of-mouth, Facebook groups) are inefficient, unsafe, and time-consuming. Teachers lack a professional platform to showcase their qualifications and reach potential students.

---

## 4. Target Users

| User Type | Description |
|-----------|-------------|
| **Parents** | Looking for home tutors for their children (K-12) |
| **Teachers** | Offering private tutoring services |
| **Admins** | Platform managers and support staff |

---

## 5. Core Features (MVP)

### 5.1 Parent Features
- Browse/search teachers by location, subject, stage
- View teacher profiles with ratings and pricing
- Send contact requests to teachers
- Save favorite teachers for comparison
- Post "Looking for Tutor" requests
- Receive notifications for updates

### 5.2 Teacher Features
- Create professional profile
- Set subjects, stages, and flexible pricing (hourly/monthly, online/home)
- Receive contact requests from parents
- Browse parent tutor requests
- View profile statistics (views, contacts)
- Receive notifications for new requests

### 5.3 Admin Features
- Dashboard with platform statistics
- Manage users (teachers, parents)
- Manage subjects and educational stages
- View and moderate contact requests

---

## 6. Business Model

### Revenue Streams
1. **Featured Listings** - Teachers pay to appear at top of search
2. **Subscription Plans** - Monthly plans for teachers (more visibility, badges)
3. **Future:** Commission on lessons booked through platform

### Pricing Strategy (MVP)
- Free registration for all users
- Basic listing is free for teachers
- Premium features available later

---

## 7. Success Metrics

| Metric | First Month Target |
|--------|-------------------|
| Registered Teachers | 20 |
| Registered Parents | 50 |
| Contact Requests | 30 |
| Website Visits | 500 |

---

## 8. Technical Architecture

### Applications
| App | Technology | Description | Status |
|-----|------------|-------------|--------|
| **zads_web** | Nuxt 3, Vuetify 3, Pinia | Web App for Parents & Teachers | ⭐ **Active** |
| **zads-api** | Node.js, Express, Prisma, PostgreSQL | Backend API | ⭐ **Active** |
| **zads-dashboard** | Vue 3, Vuetify 3 (Vuexy) | Admin Dashboard | ⭐ **Active** |
| **zads_app** | Flutter, Riverpod, Dio | Mobile App (iOS/Android) | ⏸️ **Paused** |

### Infrastructure
- **Hosting:** User's existing server
- **Database:** PostgreSQL
- **Authentication:** JWT-based
- **Maps:** Simple Location Selection (Governorate/City)

---

## 9. User Stories

### Parent Stories
- As a parent, I want to search for teachers near me so I can find convenient options
- As a parent, I want to filter by subject and stage so I find relevant teachers
- As a parent, I want to compare teachers side-by-side so I can make informed decisions
- As a parent, I want to contact a teacher directly so I can arrange lessons

### Teacher Stories
- As a teacher, I want to create a profile so parents can find me
- As a teacher, I want to set my own pricing for different lesson types
- As a teacher, I want to receive notifications when parents contact me
- As a teacher, I want to see how many parents viewed my profile

### Admin Stories
- As an admin, I want to see platform statistics on a dashboard
- As an admin, I want to manage user accounts
- As an admin, I want to add/edit subjects and educational stages

---

## 10. Non-Functional Requirements

- **Language:** Arabic (RTL) primary, English secondary
- **Performance:** API response < 500ms
- **Security:** JWT auth, input validation, rate limiting
- **Browser Support:** Chrome, Safari, Firefox (latest 2 versions)

---

## 11. Future Enhancements (Post-MVP)

### Phase 2: Mobile Apps
- Resume Flutter mobile app development
- Deploy to iOS App Store and Google Play

### Phase 3: Premium Features
1. **Online Learning:** Video lessons, live tutoring
2. **Marketplace:** School supplies, textbooks, study materials
3. **Payments:** In-app payments and commission system
4. **Reviews:** Parent reviews and ratings for teachers
5. **Messaging:** In-app chat between parents and teachers
6. **Notifications:** Advanced notification preferences

---

*Last Updated: February 7, 2026*
