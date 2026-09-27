# Start here — Senior Frontend to Fullstack

This path is for someone who already ships React and TypeScript in the UI and wants **TypeScript at the API boundary, Node.js, and SQL**. It is not a frontend course.

Zads is the exercise. The app is TypeScript (`zads-app`). The API is JavaScript on Node, Express, and Prisma (`zads-api`). You will read both. The ideas are the same: request, validate, query, respond.

---

## Where to start

Read this file, then do **day 1**. Do not open `01-nextjs-react.md` from the top. That file teaches React.

| File | When |
|------|------|
| This file | Map and calendar |
| [02-expressjs-node.md](./02-expressjs-node.md) | Days 6–12 |
| [03-postgresql-prisma.md](./03-postgresql-prisma.md) | Days 13–19 |
| [04-platform-now.md](./04-platform-now.md) | Day 0 (sketch) and days 20–21 (apply it) |
| `zads-app/src/types/index.ts` | Days 1–5 |
| `zads-api/src/app.js` | First backend file you open |

---

## Calendar: 21 days, 2 hours a day

About **42 hours**. That is a short path for a senior frontend, and it is not a shortcut where you only watch videos. At **3 hours a day**, run the same plan in **14 days** (two days per sitting).

Do not add the week counts inside `02` and `03` on top of this. Those files are written as standalone from-scratch courses. Here you only walk the parts listed below.

One rest day a week is fine. If you stop, resume at the last exercise. Do not restart a video course.

### Day 0 — 45 minutes, before day 1

In [04-platform-now.md](./04-platform-now.md), read how the browser reaches the API, and the privacy contracts. You need to know the request path, and that public teacher search does not return phone numbers.

---

### Days 1–5 — TypeScript (10 hours)

You already write TypeScript in the UI. The gap is not `string` and `number`. The gap is describing an **API response** and a **request body**, and knowing TypeScript is gone at runtime so Zod has to check.

| Day | 2 hours | Do this |
|-----|---------|---------|
| 1 | Types you actually use | Open `zads-app/src/types/index.ts`. Follow `UserType`, `ContactRequestStatus`, and `ApiResponse<T>`. Write your own type for `GET /api/teachers/:id` without copying the whole file |
| 2 | Narrowing | A union and `status === "accepted"` change the type. Tie that to privacy: the phone exists on the type only after acceptance |
| 3 | Generics | `ApiResponse<T>` and `PaginatedResponse<T>`. Explain `apiGet<T>` without looking at `src/lib/api.ts` |
| 4 | Zod | Runtime checks. Compare `zads-api/src/utils/validators.js` with a frontend type. The type does not protect the server |
| 5 | Close the loop | Pick one contact-request endpoint. Write the request type and the response type in a scratch file. If the type lies about the handler, the type is wrong |

**Video (only the listed parts):**

- [Beginner's TypeScript — Matt Pocock](https://www.totaltypescript.com/tutorials/beginners-typescript) — 18 free video exercises. On days 1–2, do the exercises through union types and typing functions. Skip any exercise that is obvious.
- [Zod — Total TypeScript](https://www.totaltypescript.com/tutorials/zod) — day 4. 10 exercises. Zads validates with Zod.
- [React with TypeScript](https://www.totaltypescript.com/tutorials/react-with-typescript) — **optional**. Open it only if component props are still painful. It is not part of the 10 hours.
- Reference, not a course: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).

**Done when:** you can add a field in `types/index.ts` and say whether it describes the server response or only the UI.

---

### Days 6–12 — Node.js and Express (14 hours)

The API is not TypeScript. Learn server JavaScript first. You can rewrite a route in TypeScript later. Do not learn MongoDB. Zads uses PostgreSQL.

| Day | Hours | File in Zads | Section in [02](./02-expressjs-node.md) |
|-----|-------|--------------|------------------------------------------|
| 6 | 2 | `zads-api/src/app.js` through `listen` | Phase 1: how Node runs a file, `require`, the event loop |
| 7 | 2 | Same `app.js`: middleware order | Phase 2: Express, `app.use`, why order matters |
| 8 | 2 | `src/middlewares/auth.js` and the error middleware | Phase 3: `next()`, who catches the error |
| 9 | 2 | `src/routes/teachers.routes.js` plus the first function in `teachers.controller.js` | Phase 4: route, then controller, then Prisma |
| 10 | 2 | `src/controllers/auth.controller.js` login | Phase 5: JWT. The token the app sends as `Authorization` |
| 11 | 2 | `src/utils/validators.js` and `src/routes/auth.routes.js` | Phase 6: validate before a row is written |
| 12 | 2 | `contactRequests.controller.js` — create a request and change status | Phase 7 only as far as contact requests. Leave the rest |

**Video:**

- [What the heck is the event loop?](https://www.youtube.com/watch?v=8aGhZQkoFbQ) — day 6. About 26 minutes. Watch this before you write a route, then go back to `app.js`.
- [Node.js Crash Course — The Net Ninja](https://www.youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymONOKxwBU) — days 7–9. Watch lessons 1–6, 8, and 10–11 (basics, requests, npm, Express, middleware, router). **Skip** the view-engine lesson and the MongoDB lesson. Zads uses neither.
- Reference: [Node.js event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) and [Express routing](https://expressjs.com/en/guide/routing.html).

**Done when:** you can trace `POST /api/contact-requests` from `app.js` to the response, and name where the token is checked and where the row is written.

---

### Days 13–19 — SQL, then Prisma (14 hours)

Prisma is not a substitute for SQL. When a query looks wrong, you will read SQL. Write the query yourself first, then see how Prisma expresses it.

| Day | Hours | Do this |
|-----|-------|---------|
| 13 | 2 | Tables, keys, `SELECT` / `WHERE`. Sketch the `users` table from `schema.prisma` on paper |
| 14 | 2 | `JOIN`. Write SQL that loads a teacher with their name from `users` and their area from `areas` |
| 15 | 2 | One-to-many and many-to-many. Why `teacher_subjects` is its own table. Phase 3 in [03](./03-postgresql-prisma.md) |
| 16 | 2 | The day-14 query in Prisma inside `teachers.controller.js` (`include` / `select`). Phase 4 |
| 17 | 2 | Indexes and `UNIQUE`. Why `phone` is unique, and why a second pending contact is rejected. Read migration `20260926170000_contact_idempotency_and_analytics_funnel` |
| 18 | 2 | A migration that does not wipe data. Phase 5. Know `migrate dev` versus `migrate deploy`. Do not reset a shared database |
| 19 | 2 | Exercise: “pending requests for one teacher, with no phone numbers.” Write the SQL, then find the controller code that strips the phone |

**Video:**

- [Learn SQL in 60 Minutes — Web Dev Simplified](https://www.youtube.com/watch?v=p3qvj9hO_Bo) — days 13–14. Watch it once, then do the exercises linked in the description. The SQL transfers to PostgreSQL.
- [PostgreSQL Tutorial for Beginners — freeCodeCamp](https://www.youtube.com/watch?v=SpfIwlAYaKk) — days 15 and 17. About 3 hours. **Skip** the Windows install. Watch keys, relationships, joins, and constraints. Pause and write the query against the Zads schema.
- Short drills, no video: [pgexercises.com](https://pgexercises.com/) — 30–40 minutes on day 15. Do the join exercises.
- Prisma without a long course: [Prisma docs — queries](https://www.prisma.io/docs/orm/prisma-client/queries/crud). Read that on day 16 with the controller open.

**Done when:** you can write a join in SQL and translate it to Prisma without copying an old example line by line.

---

### Days 20–21 — Prove the path closed (4 hours)

No new videos. Pick **one contact request** and follow it:

1. The page in `zads-app` and the store.
2. The call in `src/lib/api.ts` and the proxy `src/app/api/[...backend]/route.ts`.
3. The route and controller in `zads-api`.
4. The `contact_requests` row and `pending → accepted`.
5. When the phone is visible. The rules are in [04-platform-now.md](./04-platform-now.md).

Write that trace in half a page. If you get stuck, that spot needs another day. It does not need another course.

---

## Exit check

You can answer these without opening a file:

1. Why is a TypeScript type not enough to reject a bad request on the server?
2. What is the middleware order in `app.js`, and what happens if `auth` is registered after the route?
3. Write a `JOIN` across `teachers`, `users`, and `areas`.
4. What is the difference between a `pending` and an `accepted` contact request for the phone number?
5. How do you add a column without wiping a shared database?

If those five are clear, you can change an API handler, a table, and a frontend type in the same piece of work. That is fullstack on this stack. It is not a database-administrator certificate.

---

## Do not do this

- Do not start with React or with `01-nextjs-react.md`, unless a Next.js 16 detail is actually blocking you (the proxy or `proxy.ts`).
- Do not watch a Mongo or MERN course. It pulls you off PostgreSQL.
- Do not finish an 8-hour course. The calendar above names the lessons.
- Do not stack the old “3 weeks of Node” plus “3 weeks of SQL” titles. This file is the clock.
