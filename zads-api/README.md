# Zads API

Backend API for the Zads educational marketplace platform.

## Tech Stack

- Node.js 18+
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## Setup

1. **Clone and install dependencies:**
```bash
cd zads-api
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/zads
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

3. **Setup database:**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed initial data (admin, subjects, stages)
npx prisma db seed
```

## Running Locally

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

API will be available at: `http://localhost:3000`

## Default Admin Credentials

After seeding:
admin
- **Phone:** 01000000000
- **Password:** admin123
parent
- **Phone:** 01222222222
- **Password:** parent123
teacher
- **Phone:** 01111111111
- **Password:** teacher123

## API Documentation

See root docs:

- `../TECH_PLAN.md` (unified technical plan)
- `../DOCUMENTATION.md` (unified product/platform docs)
- `../CODEBASE_OVERVIEW.md`
- `../FEATURES_OVERVIEW.md`

### Quick Reference

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | Login |
| `GET /api/teachers` | Search teachers |
| `GET /api/subjects` | List subjects |
| `GET /api/stages` | List stages |
| `GET /api/admin/dashboard` | Admin stats |

## Scripts

```bash
npm run dev      # Start development server
npm start        # Start production server
npm run db:push  # Push schema changes
npm run db:seed  # Seed database
```
