# خطة تعلم React و Next.js و Node.js من مشروع Zads

هذه خطة تعلم عملية مبنية على الكود الحالي في هذا الريبو. أنت قادم من Vue.js، لذلك كل أسبوع يربط المفاهيم الجديدة بما تعرفه من Vue/Nuxt/Pinia.

## خريطة المشروع

- `zads-app/`: التطبيق الجديد، Next.js + React + TypeScript.
- `zads-api/`: Backend، Express + Prisma + PostgreSQL.
- `zads_web/`: تطبيق Nuxt القديم، يستخدم كمرجع لسلوك الواجهة.
- `zads-dashboard/`: لوحة الإدارة القديمة، تستخدم كمرجع لسلوك صفحات admin.

الأولوية في التعلم والتطوير الجديد هي `zads-app` و `zads-api`.

## قبل البداية

اقرأ هذه الملفات أولا:

- `README.md`
- `CODEBASE_OVERVIEW.md`
- `FEATURES_OVERVIEW.md`
- `zads-app/AGENTS.md`
- `zads-app/package.json`
- `zads-api/package.json`

ملاحظة مهمة: `zads-api/src/app.js` يستخدم `PORT=3000` كقيمة افتراضية، بينما `zads-app/src/lib/api.ts` يستخدم `http://localhost:3001/api` كقيمة افتراضية. قبل التشغيل، وحّد الإعدادات عبر `.env`، مثلا:

```bash
# zads-api/.env
PORT=3000

# zads-app/.env.local
API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## الأسبوع 1: React لمطور Vue

الهدف: تفهم JSX، props، composition، events، والفرق بين React component و Vue SFC.

اقرأ بالترتيب:

- `zads-app/src/components/shared/ErrorBanner.tsx`
- `zads-app/src/components/shared/PageSkeleton.tsx`
- `zads-app/src/components/shared/TeacherCard.tsx`
- `zads-app/src/components/shared/TutorRequestCard.tsx`
- `zads-app/src/components/ui/button.tsx`

قارن:

```txt
Vue <template>          -> React JSX inside return
v-if                    -> {condition && <Block />}
v-for                   -> items.map(item => <Block key={item.id} />)
defineProps             -> function Component(props: Props)
defineEmits             -> callback props like onClick/onSubmit
class binding           -> clsx/cn/helper functions
Vuetify component props -> shadcn/base-ui + Tailwind class variants
```

تمارين:

- أنشئ `StarRating.tsx` في `zads-app/src/components/shared/`.
- خليه يستقبل `rating`, `count`, و `size`.
- استخدمه داخل `TeacherCard.tsx`.
- قارن نفس الفكرة لو كتبتها في Vue باستخدام props و computed.

## الأسبوع 2: Hooks و Client Components

الهدف: تفهم بديل Composition API في React.

اقرأ:

- `zads-app/src/lib/ability.tsx`
- `zads-app/src/stores/_example.ts`
- `zads-app/src/stores/_convention.ts`
- أي صفحة فيها form أو interaction تحت `zads-app/src/app/[locale]/auth/`

قارن:

```txt
ref/reactive            -> useState or Zustand store state
computed                -> useMemo or derived render values
watch                   -> useEffect with dependencies
onMounted               -> useEffect(() => {}, [])
provide/inject          -> createContext/useContext
composable              -> custom hook or store action
```

قاعدة مهمة في Next.js:

- Server Component هو الافتراضي. لا تستخدم فيه `useState`, `useEffect`, browser APIs, أو event handlers.
- Client Component يحتاج أول سطر: `"use client"`.
- استخدم Client Component فقط عند الحاجة إلى interaction أو hooks.

تمارين:

- افتح `zads-app/src/lib/ability.tsx` واكتب بجانبه ملاحظات: ما الذي كان سيكون `provide/inject` في Vue؟
- خذ component بسيط من `zads_web/components/` وحاول إعادة كتابته كـ React component في `zads-app`.

## الأسبوع 3: Next.js App Router

الهدف: تفهم routing, layouts, dynamic segments, route groups العملية في التطبيق الجديد.

اقرأ:

- `zads-app/src/app/layout.tsx`
- `zads-app/src/app/page.tsx`
- `zads-app/src/app/[locale]/layout.tsx`
- `zads-app/src/i18n/routing.ts`
- `zads-app/src/i18n/request.ts`
- `zads-app/next.config.ts`
- `zads-app/src/proxy.ts`

خريطة routes الحالية المهمة:

```txt
zads-app/src/app/page.tsx
  -> root entry / redirect

zads-app/src/app/[locale]/public/page.tsx
  -> /ar/public or /en/public

zads-app/src/app/[locale]/auth/login/page.tsx
  -> /ar/auth/login or /en/auth/login

zads-app/src/app/[locale]/auth/register/client/page.tsx
  -> /ar/auth/register/client or /en/auth/register/client

zads-app/src/app/[locale]/client/client/page.tsx
  -> /ar/client/client or /en/client/client

zads-app/src/app/[locale]/teacher/teacher/page.tsx
  -> /ar/teacher/teacher or /en/teacher/teacher

zads-app/src/app/[locale]/admin/admin/page.tsx
  -> /ar/admin/admin or /en/admin/admin
```

ملاحظة: هناك تكرار في المسارات مثل `client/client`, `teacher/teacher`, و `admin/admin`. هذا قد يكون مقصودا حاليا أو أثر من النقل. لا تفترض route أقصر قبل مراجعة الملفات الفعلية.

قارن:

```txt
Nuxt pages/             -> Next app/ folders with page.tsx
Nuxt layouts            -> layout.tsx
Vue Router :id          -> [id]
router.beforeEach       -> proxy.ts / middleware-like routing guard
useRoute params         -> page props: params
```

تمارين:

- تتبع صفحة `zads-app/src/app/[locale]/client/client/settings/page.tsx` من route إلى components إلى stores.
- افتح `zads-app/src/proxy.ts` وحدد protected routes.
- لاحظ أن backend enum في `zads-api/prisma/schema.prisma` هو lowercase: `teacher`, `parent`, `admin`. لو وجدت checks تستخدم `TEACHER` أو `ADMIN`، اعتبرها نقطة تحتاج تصحيح.

## الأسبوع 4: State Management و API Layer

الهدف: تفهم Zustand كبديل Pinia، وتفهم اتصال Next app بالـ API.

اقرأ:

- `zads-app/src/stores/_convention.ts`
- `zads-app/src/stores/auth.ts`
- `zads-app/src/stores/client.ts`
- `zads-app/src/stores/search.ts`
- `zads-app/src/stores/teacher.ts`
- `zads-app/src/lib/api.ts`
- `zads-app/src/lib/auth.ts`
- `zads-app/src/types/index.ts`

قارن:

```txt
Pinia defineStore       -> Zustand create()
state refs              -> plain state object
actions                 -> functions inside store
storeToRefs             -> useStore(selector)
Axios plugin            -> shared api.ts client
Nuxt auth cookie        -> NextAuth JWT session
```

تدفق auth الحالي:

```txt
Login form
-> auth store / signIn("credentials")
-> zads-app/src/lib/auth.ts authorize()
-> POST zads-api /api/auth/login
-> API returns JWT
-> NextAuth stores JWT/session
-> zads-app/src/lib/api.ts reads session
-> Axios attaches Authorization: Bearer <apiToken>
```

تمارين:

- ارسم flow login بالكامل من الصفحة إلى API.
- خذ store واحد من `zads_web/stores/` وقارنه بالنسخة الجديدة في `zads-app/src/stores/`.
- اكتب action جديدة بسيطة في Zustand تقرأ endpoint موجود، مثلا subjects أو stages.

## الأسبوع 5: Node.js و Express

الهدف: تفهم backend request lifecycle من route إلى controller إلى database.

اقرأ بالترتيب:

- `zads-api/src/app.js`
- `zads-api/src/routes/auth.routes.js`
- `zads-api/src/controllers/auth.controller.js`
- `zads-api/src/middlewares/auth.js`
- `zads-api/src/middlewares/validate.js`
- `zads-api/src/middlewares/error.js`
- `zads-api/src/utils/response.js`
- `zads-api/src/utils/validators.js`
- `zads-api/src/config/env.js`
- `zads-api/src/config/database.js`

النمط الأساسي:

```txt
Request
-> global middleware: cors, helmet, json parser
-> route file
-> validation middleware
-> auth/role middleware when needed
-> controller
-> Prisma query
-> response helper
-> error middleware if something fails
```

مثال:

```txt
POST /api/auth/login
-> zads-api/src/routes/auth.routes.js
-> validate(loginSchema)
-> authController.login
-> prisma.user.findUnique()
-> bcrypt.compare()
-> jwt.sign()
-> response.success()
```

تمارين:

- اقرأ `zads-api/src/controllers/teachers.controller.js` وركز على search/filter query.
- اختر route واحد من `parents.routes.js` أو `tutorRequests.routes.js` وتتبعه حتى Prisma.
- اكتب ملاحظاتك: ما هي input validation؟ ما هو role guard؟ ما هي relations التي يتم include؟

## الأسبوع 6: Prisma و Database

الهدف: تفهم schema, relations, migrations, و query patterns.

اقرأ:

- `zads-api/prisma/schema.prisma`
- `zads-api/prisma/seed.js`
- `zads-api/prisma/migrations/*/migration.sql`

مفاهيم أساسية:

```txt
model User              -> table
@id                     -> primary key
@unique                 -> unique constraint
@relation               -> foreign key relation
@@index                 -> database index
@map                    -> database column name
@@map                   -> database table name
enum                    -> constrained values
```

ابحث داخل controllers عن:

```js
prisma.user.findUnique()
prisma.teacher.findMany()
prisma.parent.update()
prisma.teacherSubject.create()
prisma.$transaction()
```

تمارين:

- شغّل Prisma Studio بعد ضبط env:

```bash
cd zads-api
npx prisma studio
```

- افتح `User`, `Teacher`, `Parent`, `TutorRequest` وشاهد العلاقات.
- اكتب query ذهنية: كيف تجيب teacher مع user و subjects و area؟

## الأسبوع 7: Migration Thinking من Vue إلى Next

الهدف: تتعلم كيف تنقل feature موجودة من `zads_web` أو `zads-dashboard` إلى `zads-app`.

اختر feature واحدة:

- Client favorites
- Client dependents
- Teacher subjects
- Admin subjects
- Admin tutor requests

خطوات النقل:

1. اقرأ الصفحة القديمة في `zads_web/pages/**` أو `zads-dashboard/src/pages/**`.
2. اقرأ Pinia store القديم.
3. حدد API endpoints المستخدمة.
4. افتح صفحة Next المقابلة في `zads-app/src/app/[locale]/**`.
5. افحص Zustand store المقابل.
6. انقل السلوك، وليس شكل Vue component حرفيا.
7. اختبر role/auth/API flow.

تمرين عملي:

- خذ صفحة `zads_web/pages/parent/favorites.vue`.
- قارنها مع `zads-app/src/app/[locale]/client/client/favorites/page.tsx`.
- اكتب checklist لما تم نقله وما لم ينقل بعد.

## الأسبوع 8: Feature كاملة صغيرة

الهدف: تبني feature كاملة end-to-end حتى تتأكد أنك فهمت React + Next + Express + Prisma.

اقتراح feature: Reviews للمعلمين.

Backend:

- أضف `Review` model في `zads-api/prisma/schema.prisma`.
- أضف migration.
- أضف `reviews.controller.js`.
- أضف `reviews.routes.js`.
- اربط route في `zads-api/src/app.js`.
- أضف validation schemas في `zads-api/src/utils/validators.js`.

Frontend:

- أضف types في `zads-app/src/types/index.ts`.
- أضف `zads-app/src/stores/reviews.ts`.
- أضف `ReviewCard.tsx`.
- أضف reviews section في teacher detail page.

الهدف ليس كثرة الكود. الهدف أن تفهم الرحلة كاملة من UI event إلى database row ثم الرجوع للواجهة.

## مصادر رسمية مفيدة

- React: https://react.dev/learn
- Next.js App Router: https://nextjs.org/docs/app
- Express routing: https://expressjs.com/en/guide/routing.html
- Prisma: https://www.prisma.io/docs
- Zustand: https://zustand.docs.pmnd.rs
- Auth.js / NextAuth: https://authjs.dev
