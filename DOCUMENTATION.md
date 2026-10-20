# Zads (زاد) — Unified Documentation & Technical Handbook

This is the canonical handbook for the entire Zads platform. It covers product domain context, technical architecture, codebase structures, complete feature-to-code route maps, and long-term architectural expansions.

---

## Section 1: Product & Domain Overview

### 1.1 What is Zads?
**زاد (Zads)** is a **direct educational connection platform** built on the concept of **«الجيرة التعليمية»** (neighborhood learning). It directly connects learners and families with verified teachers and instructors in the **same city and district**, with an initial geographical launch focus on **6th of October City and Giza**.

**Core Operating Principle (Zero Commission):**
Zads is **not** a tutoring center (سنتر) and does not take a percentage or commission from lesson fees. Teachers set their own prices; families connect with them directly. The platform provides discovery, verified credentials, and communication coordination.

### 1.2 Session Placement & Formats
The platform supports flexible formats for lessons:
1. **Online** — live sessions over video conferencing.
2. **At the learner’s place (حضوري منزلي)** — the teacher travels to the learner.
3. **At the teacher’s place (عند المعلم)** — the learner travels to the teacher.
4. **Group / Center** — group sessions or dedicated classrooms.

In the database schema, this is represented by:
- `studyMode`: `'online'` | `'offline'`
- `teachingPlace`: `'at_student'` | `'at_teacher'` | `'group'` | `'online'`
- `TeacherSubject`: `priceOnline`, `priceOffline`, `priceAtTeacher`, `priceAtStudent`, `priceGroup`, `durationMinutes`.

### 1.3 Key Personas & Roles
- **Client / Parent** (`userType=parent`): Manages dependents/children, searches teachers, manages favorites, creates tutor requests, and tracks direct contact requests.
- **Teacher** (`userType=teacher`): Manages profile, credentials, subjects & pricing, availability slots, and manages incoming contact requests.
- **Admin** (`userType=admin`): Manages platform entities, reviews verification documents, audits audit trails, and monitors system-wide contacts.

---

## Section 2: Technical Architecture & Environment Setup

### 2.1 Monorepo Architecture
Zads is built as a unified repository composed of:
1. **Frontend App (`zads-app/`)**: Built on Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui, Zustand, next-intl, and Auth.js v5.
2. **Backend API (`zads-api/`)**: Built on Node.js, Express, Prisma ORM, and PostgreSQL.
3. **Legacy Projects (`legacy/`)**: Archived Vue 3/Nuxt 3 codebases kept for historical reference.

```
┌─────────────────────────────────┐
│        Web App (Next.js)        │
│   (Visitor, Parent, Teacher,    │
│            Admin)               │
└────────────────┬────────────────┘
                 │ (Axios API Client / NextAuth Session)
                 ▼
        ┌─────────────────┐
        │   REST (API)    │ (Express.js)
        └────────┬────────┘
                 ▼
        ┌─────────────────┐
        │   PostgreSQL    │ (Prisma ORM)
        └─────────────────┘
```

### 2.2 Local Development Setup

#### Backend API Setup
```bash
cd zads-api
pnpm install
cp .env.example .env
# Edit .env database credentials
npx prisma migrate deploy
pnpm run db:seed
pnpm run dev
```
API runs on `http://127.0.0.1:3000` (base: `http://127.0.0.1:3000/api`). The app's `API_BASE_URL` uses `127.0.0.1` too: on Node 18+ `localhost` can resolve to `::1`, where the API is not listening.

#### Frontend Next.js App Setup
```bash
cd zads-app
pnpm install
cp .env.local.example .env.local
pnpm run dev
```
App runs on `http://localhost:3001` (redirects automatically to `/ar` or `/en`).

### 2.3 Safe Database Migrations
Migrations are managed strictly via Prisma:
- Staging/Production: `npx prisma migrate deploy` applies migrations non-interactively without data drops or resets.
- Zero drift verification: `npx prisma migrate diff` verifies exact alignment between `schema.prisma` and the database.

---

## Section 3: Privacy, Security & Data Contracts

### 3.1 Privacy Allowlist & Phone Number Masking
- **Public Teacher Search & Public Profile:** User phone numbers are strictly stripped from all public discovery endpoints (`/api/teachers`, `/api/teachers/:id`). Only public profile details (name, avatar, bio, subjects, pricing, availability) are exposed.
- **Certificate Documents:** Uploaded degree certificates are stored in `/public/uploads/certificates/` and gated behind authentication. Only platform administrators and the owning teacher can access or view certificate files.
- **Contact Request Privacy:** Phone numbers between parents and teachers remain completely hidden (`null`) while a contact request is in `'pending'` or `'rejected'` status. Phone numbers are revealed to both parties **only** after mutual acceptance (`status === 'accepted'`).

### 3.2 Contact Request State Machine
- Permitted transitions: `pending` → `accepted` | `rejected`.
- **Initiator Rule:** The user who initiated the request cannot accept or reject their own request.
- **Idempotency:** Creating duplicate `pending` requests between the same parent and teacher for the same subject is rejected with `409 Conflict`.
- **Audit Persistence:** Stores `studyMode`, `teachingPlace`, `preferredTime`, `tutorRequestId`, and `replyMessage`.

### 3.3 Account Security & Egyptian Phone Normalization
- **Phone Normalization:** All Egyptian mobile numbers (`010`, `011`, `012`, `015`) in local, international (`+20`, `0020`), or formatted representations are normalized to the canonical 11-digit format `01xxxxxxxxx`.
- **Password Updates:** Password changes require `currentPassword` verification via `bcrypt.compare` before hashing and updating `passwordHash`.

---

## Section 4: Complete Feature & Route Map

| Feature Area | Next.js Page Route File | API Endpoint / Route File | Description |
| :--- | :--- | :--- | :--- |
| **Public Landing** | `src/app/[locale]/public/page.tsx` | N/A | Landing with 6th of October regional section |
| **Public Teachers** | `src/app/[locale]/public/teachers/page.tsx` | `GET /api/teachers` | Open public teacher discovery with filters |
| **Public Teacher Detail** | `src/app/[locale]/public/teachers/[id]/page.tsx` | `GET /api/teachers/:id` | Teacher profile, subjects, rates, verified badge |
| **Join as Teacher** | `src/app/[locale]/public/join-teacher/page.tsx` | N/A | Value proposition, zero commission explanation |
| **About Us** | `src/app/[locale]/public/about/page.tsx` | N/A | Platform mission and vision |
| **How It Works** | `src/app/[locale]/public/how-it-works/page.tsx` | N/A | 3-step coordination workflow |
| **Terms of Service** | `src/app/[locale]/public/terms/page.tsx` | N/A | Honest terms, zero commission disclaimer |
| **Privacy Policy** | `src/app/[locale]/public/privacy/page.tsx` | N/A | Phone masking & document security policies |
| **Contact & Support** | `src/app/[locale]/public/contact/page.tsx` | N/A | Direct assistance & password recovery guidance |
| **Auth Login** | `src/app/[locale]/auth/login/page.tsx` | `POST /api/auth/login` | NextAuth phone-based authentication |
| **Forgot Password** | `src/app/[locale]/auth/forgot-password/page.tsx` | N/A | Honest verified account recovery guidance |
| **Client Registration** | `src/app/[locale]/auth/register/client/page.tsx` | `POST /api/auth/register/parent` | Parent/learner registration |
| **Teacher Registration** | `src/app/[locale]/auth/register/teacher/page.tsx` | `POST /api/auth/register/teacher` | Teacher registration |
| **Client Portal** | `src/app/[locale]/client/page.tsx` | `GET /api/parents/me` | Client dashboard & recommendations |
| **Client Teacher Details**| `src/app/[locale]/client/teacher/[id]/page.tsx` | `GET /api/teachers/:id` | Direct contact modal & slot selection |
| **Teacher Portal** | `src/app/[locale]/teacher/page.tsx` | `GET /api/teachers/me/stats` | Teacher statistics and overview |
| **Teacher Browse** | `src/app/[locale]/teacher/browse/page.tsx` | `GET /api/tutor-requests` | Nearby student requests & direct responses |
| **Teacher Subjects** | `src/app/[locale]/teacher/subjects/page.tsx` | `GET/POST/PUT /api/teachers/me/subjects` | Subject management with duplicate handling |
| **Teacher Availability**| `src/app/[locale]/teacher/profile/page.tsx` | `GET/PUT /api/teachers/me/availability` | 24h schedule with overlap prevention |
| **Admin Teachers** | `src/app/[locale]/admin/teachers/page.tsx` | `GET /api/admin/teachers` | Paginated teachers list & verification toggle |
| **Admin Parents** | `src/app/[locale]/admin/parents/page.tsx` | `GET /api/admin/parents` | Paginated parents list & account status |
| **Admin Contact Requests**| `src/app/[locale]/admin/requests/page.tsx` | `GET /api/admin/contact-requests` | Contact request audit management & details modal |

---

## Section 5: Non-Curricular Learning Architectural Design (Z19)

### 5.1 Product Vision & Need
While Zads launched with a primary focus on Egyptian school curricula (National General, Languages, Experimental, Al-Azhar, and IGCSE/American), the platform's vision of **«الجيرة التعليمية»** encompasses lifelong learning. Learners in 6th of October and across Egypt frequently seek:
1. **Quran Recitation & Tajweed (تحفيظ القرآن وأحكام التجويد):** For children and adults, with Ijazah-certified tutors.
2. **Coding, Robotics & Software (البرمجة والذكاء الاصطناعي للأطفال والشباب):** Python, Scratch, Web Development.
3. **Conversational Languages (اللغات الحية للكبار):** Spoken English, German, French, Italian for work and travel.
4. **Fine Arts & Music (الفنون والخط العربي والموسيقى):** Calligraphy, sketching, instruments.
5. **Life Skills & Professional Development:** Public speaking, mental math, soft skills.

### 5.2 Schema Evolution Strategy (Zero-Breaking)
The existing database schema binds subjects to `Stage` (المرحلة الدراسية). Non-curricular subjects differ in three key ways:
- They do not belong to a school grade (e.g. Adult German is not "3rd Prep").
- They are categorized by skill track rather than educational level.
- They evaluate proficiency by level (Beginner / Intermediate / Advanced) rather than academic term.

#### Proposed Prisma Schema Additions:
```prisma
enum SubjectTrack {
  academic_k12     // Traditional Egyptian & International school curricula
  quran_islamic    // Quran memorization, Tajweed, Islamic studies
  languages        // Spoken and professional languages
  tech_coding      // Programming, robotics, computer literacy
  arts_music       // Arabic calligraphy, arts, instruments
  life_skills      // Mental math, public speaking, development
}

enum ProficiencyLevel {
  all_levels
  beginner
  intermediate
  advanced
}

// Evolution of Subject model:
model Subject {
  id          String        @id @default(uuid())
  nameAr      String        @map("name_ar")
  nameEn      String        @map("name_en")
  icon        String?
  track       SubjectTrack  @default(academic_k12)
  sortOrder   Int           @default(0) @map("sort_order")
  isActive    Boolean       @default(true) @map("is_active")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  teacherSubjects TeacherSubject[]
  parentSubjects  ParentChildSubject[]
  tutorRequests   TutorRequest[]
  contactRequests ContactRequest[]

  @@map("subjects")
}

// Evolution of TeacherSubject model:
model TeacherSubject {
  id              String            @id @default(uuid())
  teacherId       String            @map("teacher_id")
  subjectId       String            @map("subject_id")
  stageId         String?           @map("stage_id") // Made OPTIONAL for non-curricular subjects
  proficiencyLevel ProficiencyLevel @default(all_levels) @map("proficiency_level")
  // ... existing price fields preserved
}
```

### 5.3 UI & Search Engine Integration
1. **Search Facets:** The search interface adds a top-level track toggle ("المناهج الدراسية" vs "المهارات واللغات والقرآن").
2. **Conditional Stage Filter:** If an academic subject is selected, the stage filter appears. If a non-curricular subject is selected, the stage filter is replaced by a "مستوى المتعلم" (Proficiency Level) filter.
3. **Tutor Request Posting:** Parents can post requests for Quran, Coding, or Languages without being forced to select a school child profile, utilizing `requestTarget = 'self'`.
