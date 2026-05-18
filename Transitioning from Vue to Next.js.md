# Transitioning from Vue to Next.js in Zads

This note is a practical migration map for this repository. It explains how to think when moving behavior from the old Vue/Nuxt apps into the new Next.js app.

## Current Direction

- `zads-app/` is the new primary app: Next.js, React, TypeScript, Zustand, NextAuth, Tailwind-style UI.
- `zads_web/` is the old user-facing Nuxt app. Use it as a behavior reference.
- `zads-dashboard/` is the old Vue admin dashboard. Use it as the admin behavior reference.
- `zads-api/` remains the backend API.

Do new frontend work in `zads-app` unless there is a specific reason to patch legacy behavior.

## Mental Model

Vue/Nuxt and Next.js solve similar problems, but the default architecture is different.

```txt
Vue SFC                  -> React function component
<template>               -> JSX returned from component
<script setup>           -> imports, types, hooks, component function body
props                    -> typed function props
emits                    -> callback props
slots                    -> children prop or explicit render props
Pinia                    -> Zustand
Vue Router / Nuxt pages  -> Next App Router folders
Nuxt layouts             -> layout.tsx
route middleware         -> proxy.ts / middleware-like guard
Nuxt plugin              -> provider component, lib file, or framework config
```

## Routing Map

Old Nuxt routes live in:

- `zads_web/pages/**`

Old admin routes live in:

- `zads-dashboard/src/pages/**`

New Next routes live in:

- `zads-app/src/app/**`

Examples from the current tree:

```txt
zads_web/pages/login.vue
  -> zads-app/src/app/[locale]/auth/login/page.tsx

zads_web/pages/register/parent.vue
  -> zads-app/src/app/[locale]/auth/register/client/page.tsx

zads_web/pages/parent/favorites.vue
  -> zads-app/src/app/[locale]/client/client/favorites/page.tsx

zads_web/pages/parent/children.vue
  -> zads-app/src/app/[locale]/client/client/dependents/page.tsx

zads_web/pages/teacher/subjects.vue
  -> zads-app/src/app/[locale]/teacher/teacher/subjects/page.tsx

zads-dashboard/src/pages/teachers.vue
  -> zads-app/src/app/[locale]/admin/admin/teachers/page.tsx

zads-dashboard/src/pages/subjects.vue
  -> zads-app/src/app/[locale]/admin/admin/subjects/page.tsx
```

The current Next route tree contains repeated segments such as `client/client`, `teacher/teacher`, and `admin/admin`. Treat the filesystem as source of truth until those routes are intentionally cleaned up.

## Components

In Vue, a component usually combines template, logic, and style in one `.vue` file. In `zads-app`, components are TypeScript functions returning JSX.

Vue:

```vue
<template>
  <button @click="$emit('select', teacher)">
    {{ teacher.user.name }}
  </button>
</template>
```

React:

```tsx
type Props = {
  teacher: Teacher;
  onSelect: (teacher: Teacher) => void;
};

export function TeacherButton({ teacher, onSelect }: Props) {
  return (
    <button onClick={() => onSelect(teacher)}>
      {teacher.user?.name}
    </button>
  );
}
```

Good files to study:

- `zads-app/src/components/shared/TeacherCard.tsx`
- `zads-app/src/components/shared/TutorRequestCard.tsx`
- `zads-app/src/components/shared/ErrorBanner.tsx`
- `zads-app/src/components/admin/DataTable.tsx`
- `zads-app/src/components/layout/DashboardSidebar.tsx`

## State: Pinia to Zustand

Old state:

- `zads_web/stores/*.js`
- `zads-dashboard/src/stores/*.js`

New state:

- `zads-app/src/stores/*.ts`

Mapping:

```txt
zads_web/stores/auth.js
  -> zads-app/src/stores/auth.ts

zads_web/stores/parent.js
  -> zads-app/src/stores/client.ts

zads_web/stores/children.js
  -> zads-app/src/stores/dependents.ts

zads_web/stores/favorites.js
  -> zads-app/src/stores/favorites.ts

zads_web/stores/tutorRequests.js
  -> zads-app/src/stores/tutor-requests.ts

zads_web/stores/contactRequests.js
  -> zads-app/src/stores/contact-requests.ts

zads_web/stores/teacherSubjects.js
  -> zads-app/src/stores/teacher-subjects.ts
```

Pinia pattern:

```js
export const useAuthStore = defineStore("auth", {
  state: () => ({ user: null, loading: false }),
  actions: {
    async login() {}
  }
});
```

Zustand pattern:

```ts
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  login: async () => {
    set({ loading: true });
  },
}));
```

Use selectors in components:

```tsx
const user = useAuthStore((state) => state.user);
const login = useAuthStore((state) => state.login);
```

## API Layer

Legacy Nuxt client:

- `zads_web/services/api.js`
- `zads_web/utils/api.js`

Legacy dashboard client:

- `zads-dashboard/src/services/api.js`

New Next client:

- `zads-app/src/lib/api.ts`

Backend:

- `zads-api/src/app.js`
- `zads-api/src/routes/*.routes.js`
- `zads-api/src/controllers/*.controller.js`

The new app should centralize API calls through `zads-app/src/lib/api.ts` and store domain behavior in Zustand stores.

Important configuration issue:

- Backend default port in `zads-api/src/app.js`: `3000`
- New app default API URL in `zads-app/src/lib/api.ts`: `http://localhost:3001/api`
- New app auth server URL in `zads-app/src/lib/auth.ts`: `http://localhost:3001`

Set env vars explicitly so the app and API agree:

```bash
API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## Auth and Roles

Backend user types in Prisma are lowercase:

```txt
teacher
parent
admin
```

The new app uses product language `client`, but the API still returns `parent`. Keep this distinction clear:

```txt
Product/UI name: client / learner
Backend enum: parent
```

Files to study:

- `zads-api/prisma/schema.prisma`
- `zads-api/src/middlewares/auth.js`
- `zads-api/src/controllers/auth.controller.js`
- `zads-app/src/lib/auth.ts`
- `zads-app/src/lib/api.ts`
- `zads-app/src/proxy.ts`

Watch for role casing mismatches. If frontend checks use `TEACHER` or `ADMIN`, but backend sends `teacher` and `admin`, protected redirects can break.

## Server vs Client Components

This is one of the biggest differences from Vue.

Default in Next App Router:

- Components are Server Components unless marked otherwise.
- Server Components can fetch server-side data and be `async`.
- Server Components cannot use `useState`, `useEffect`, event handlers, `window`, or `localStorage`.

Client Components:

- Add `"use client"` at the top.
- Use hooks, browser events, Zustand selectors, forms, dialogs, and local UI state.

Rule of thumb:

- Page/layout data that can be loaded on the server: Server Component.
- Interactive UI: Client Component.
- Zustand store usage in a component: Client Component.

## Migration Checklist for One Feature

Use this whenever moving a page from Vue/Nuxt to Next.

1. Locate the old page:
   - `zads_web/pages/**` for client/teacher
   - `zads-dashboard/src/pages/**` for admin
2. Locate old stores and API calls.
3. Write down exact endpoints used.
4. Check whether matching types exist in `zads-app/src/types/index.ts`.
5. Check whether a matching Zustand store exists in `zads-app/src/stores/`.
6. Create or update the Next route under `zads-app/src/app/[locale]/**`.
7. Split interactive parts into Client Components.
8. Use shared components from `zads-app/src/components/**`.
9. Use `zads-app/src/lib/api.ts` for HTTP calls.
10. Verify auth/role behavior in `zads-app/src/proxy.ts`.

## Recommended Migration Order

Use low-risk pages first:

1. Public pages: about, how it works.
2. Reference data pages: subjects, stages.
3. Client profile/settings.
4. Client dependents.
5. Favorites.
6. Teacher subjects.
7. Tutor requests.
8. Contact requests.
9. Admin dashboard tables.

## Common Mistakes

- Copying Vue component structure directly instead of translating behavior to React.
- Using hooks in a Server Component.
- Forgetting `"use client"` for interactive components.
- Adding API calls directly in many components instead of centralizing store/API logic.
- Using `client` as backend role instead of `parent`.
- Assuming routes are `/en/login` while current files point to `/en/auth/login`.
- Forgetting that route folders like `client/client` are currently real paths.
- Not setting API env vars, causing requests to hit the wrong port.

## Practical Rule

For every migration task, answer these four questions first:

```txt
What old page is the behavior coming from?
What API endpoints does it use?
What state store owns the data in zads-app?
Which parts must be Client Components?
```

After that, implementation becomes much easier to reason about.
