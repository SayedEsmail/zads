# Zads - Product Requirements Document (PRD)

## 1. Overview

**Product Name:** Zads (زاد)  
**Domain:** zads.app  
**Tagline:** "زادك للتعليم" (Your Provisions for Learning)

Zads is an Egyptian marketplace platform connecting parents seeking private tutors with qualified teachers. The platform facilitates discovery, comparison, and communication while maintaining a simple, scalable architecture.

---

## 2. Problem Statement

Egyptian parents struggle to find qualified home tutors. Current methods (word-of-mouth, Facebook groups) are inefficient, unsafe, and time-consuming. Teachers lack a professional platform to showcase their qualifications and reach potential students.

---

## 3. Target Users

| User Type | Description |
|-----------|-------------|
| **Parents** | Looking for home tutors for their children (K-12) |
| **Teachers** | Offering private tutoring services |
| **Admins** | Platform managers and support staff |

---

## 4. Core Features (MVP)

### 4.1 Parent Features
- Browse/search teachers by location, subject, stage
- View teacher profiles with ratings and pricing
- Send contact requests to teachers
- Save favorite teachers for comparison
- Save favorite teachers for comparison
- Post "Looking for Tutor" requests
- Receive push notifications for updates

### 4.2 Teacher Features
- Create professional profile
- Set subjects, stages, and flexible pricing (hourly/monthly, online/home)
- Receive contact requests from parents
- Browse parent tutor requests
- Browse parent tutor requests
- View profile statistics (views, contacts)
- Receive push notifications for new requests

### 4.3 Admin Features
- Dashboard with platform statistics
- Manage users (teachers, parents)
- Manage subjects and educational stages
- View and moderate contact requests

---

## 5. Business Model

### Revenue Streams
1. **Featured Listings** - Teachers pay to appear at top of search
2. **Subscription Plans** - Monthly plans for teachers (more visibility, badges)
3. **Future:** Commission on lessons booked through platform

### Pricing Strategy (MVP)
- Free registration for all users
- Basic listing is free for teachers
- Premium features available later

---

## 6. Success Metrics

| Metric | First Month Target |
|--------|-------------------|
| Registered Teachers | 20 |
| Registered Parents | 50 |
| Contact Requests | 30 |
| App Downloads | 100 |

---

## 7. Technical Architecture

### Applications
| App | Technology | Description |
|-----|------------|-------------|
| **zads-api** | Node.js, Express, Prisma, PostgreSQL | Backend API |
| **zads-dashboard** | Vue 3, Vuetify 3 (Vuexy) | Admin Dashboard |
| **zads_app** | Flutter, Riverpod, Dio | Mobile App (iOS/Android) |

### Infrastructure
- **Hosting:** User's existing server
- **Database:** PostgreSQL
- **Authentication:** JWT-based
- **Maps:** Simple Location Selection (Governorate/City)

---

## 8. User Stories

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

## 9. Non-Functional Requirements

- **Language:** Arabic (RTL) primary, English secondary
- **Performance:** API response < 500ms
- **Security:** JWT auth, input validation, rate limiting
- **Mobile:** iOS 12+ and Android 6+

---

## 10. Future Enhancements (Post-MVP)

1. **Online Learning:** Video lessons, live tutoring
2. **Marketplace:** School supplies, textbooks, study materials
3. **Payments:** In-app payments and commission system
4. **Reviews:** Parent reviews and ratings for teachers
5. **Messaging:** In-app chat between parents and teachers
6. **Notifications:** Advanced notification preferences
