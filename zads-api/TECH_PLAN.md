# Zads API - Technical Plan

## Overview
Backend API for the Zads platform, handling authentication, data management, and business logic.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Security | helmet, cors |
| Logging | morgan |

---

## Project Structure

```
zads-api/
├── prisma/
│   ├── schema.prisma       # Database schema (340 lines, 13+ models)
│   ├── migrations/         # Database migrations
│   ├── seed.js             # Seed data
│   └── locations-data.js   # Egyptian governorates/cities/areas
├── src/
│   ├── config/
│   │   ├── database.js     # Prisma client
│   │   └── env.js          # Environment variables
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── teachers.controller.js
│   │   ├── parents.controller.js
│   │   ├── subjects.controller.js
│   │   ├── stages.controller.js
│   │   ├── favorites.controller.js
│   │   ├── contactRequests.controller.js
│   │   ├── tutorRequests.controller.js
│   │   ├── locations.controller.js
│   │   └── admin.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── teachers.routes.js
│   │   ├── parents.routes.js
│   │   ├── subjects.routes.js
│   │   ├── stages.routes.js
│   │   ├── favorites.routes.js
│   │   ├── contactRequests.routes.js
│   │   ├── tutorRequests.routes.js
│   │   ├── locations.routes.js
│   │   └── admin.routes.js
│   ├── middlewares/
│   │   ├── auth.js         # JWT verification
│   │   ├── validate.js     # Zod validation
│   │   └── error.js        # Error handler
│   ├── services/           # Business logic services
│   ├── utils/
│   │   ├── response.js     # Standard responses
│   │   └── validators.js   # Zod schemas
│   └── app.js              # Express app entry point
├── .env.example
├── package.json
└── README.md
```

---

## Database Schema

### Models (13+ tables)
| Model | Description |
|-------|-------------|
| User | Base user (phone, password, name, type, status) |
| Teacher | Teacher profile (bio, location, avatar, rating) |
| Parent | Parent profile with area |
| ParentChild | Children linked to parents |
| ParentChildSubject | Subjects for each child |
| Subject | Educational subjects |
| Stage | Educational stages |
| TeacherSubject | M:N with pricing (hourly/monthly, home/online) |
| Favorite | Parent favorites |
| ContactRequest | Parent → Teacher requests |
| TutorRequest | Parent posts for teachers |
| Comparison | Parent teacher comparisons |
| ComparisonItem | Teachers in comparison |
| Governorate | Egyptian governorates |
| City | Cities within governorates |
| Area | Areas within cities |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/teacher | Register new teacher |
| POST | /api/auth/register/parent | Register new parent |
| POST | /api/auth/login | Login (returns JWT) |
| GET | /api/auth/profile | Get current user profile |

### Teachers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/teachers | Search teachers (with filters) |
| GET | /api/teachers/:id | Get teacher details |
| PUT | /api/teachers/profile | Update own profile |
| POST | /api/teachers/subjects | Add/update subjects |
| GET | /api/teachers/stats | Get profile stats |

### Parents
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | /api/parents/profile | Update profile |
| GET | /api/parents/children | Get children list |
| POST | /api/parents/children | Add child |
| PUT | /api/parents/children/:id | Update child |
| DELETE | /api/parents/children/:id | Delete child |

### Subjects & Stages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/subjects | List all subjects |
| POST | /api/subjects | Create subject (admin) |
| PUT | /api/subjects/:id | Update subject (admin) |
| GET | /api/stages | List all stages |
| POST | /api/stages | Create stage (admin) |
| PUT | /api/stages/:id | Update stage (admin) |

### Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/locations/governorates | List all governorates |
| GET | /api/locations/cities/:governorateId | List cities in governorate |
| GET | /api/locations/areas/:cityId | List areas in city |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/favorites | Get favorites list |
| POST | /api/favorites/:teacherId | Add to favorites |
| DELETE | /api/favorites/:teacherId | Remove from favorites |

### Contact Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contact-requests | Create request |
| GET | /api/contact-requests/incoming | Get incoming (teacher) |
| GET | /api/contact-requests/outgoing | Get outgoing (parent) |
| PATCH | /api/contact-requests/:id/status | Update status |

### Tutor Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/tutor-requests | Create request |
| GET | /api/tutor-requests | Browse requests (teacher) |
| GET | /api/tutor-requests/my | Get own requests |
| PATCH | /api/tutor-requests/:id | Update request |
| PATCH | /api/tutor-requests/:id/close | Close request |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Get statistics |
| GET | /api/admin/teachers | List all teachers |
| GET | /api/admin/parents | List all parents |
| PATCH | /api/admin/users/:id/status | Update user status |

---

## Tasks Checklist

### ✅ Completed
- [x] Project setup (Express, Prisma)
- [x] Database schema design (13+ models)
- [x] Auth endpoints (register, login, profile)
- [x] Teachers endpoints (search, profile, subjects)
- [x] Parents endpoints (profile, children)
- [x] Subjects/Stages CRUD
- [x] Favorites endpoints
- [x] Contact Requests endpoints
- [x] Tutor Requests endpoints
- [x] Admin Dashboard API
- [x] Locations API (governorates, cities, areas)

### ⏳ Pending
- [ ] Deploy to production
- [ ] Add push notification service
- [ ] Add image upload (S3/Cloudinary)

---

## Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/zads
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
NODE_ENV=development
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start dev server
npm run dev
```

---

## Default Credentials (after seeding)

| Role | Phone | Password |
|------|-------|----------|
| Admin | 01000000000 | admin123 |
| Parent | 01222222222 | parent123 |
| Teacher | 01111111111 | teacher123 |

---

*Last Updated: February 7, 2026*
