<div dir="rtl">
<style>
  pre, code, .mermaid {
    direction: ltr !important;
    text-align: left !important;
  }
  th, td {
    text-align: right !important;
  }
</style>

# ابدأ من هنا — من Senior Frontend إلى Fullstack

المسار ده مكتوب لحد بيكتب React و TypeScript في الواجهة، وعايز يقفل **TypeScript على حدود السيرفر، و Node.js، و SQL**. مش كورس فرونت.

زاد هو التمرين. الفرونت TypeScript (`zads-app`). الـ API جافاسكربت على Node و Express و Prisma (`zads-api`). هتقرأ الاتنين. الأفكار واحدة: طلب، تحقق، استعلام، رد.

---

## ابدأ منين

افتح الملف ده، وبعدين **اليوم 1**. متفتحش `01-nextjs-react.md` من أوله. ده بيشرح React، وإنت مش محتاجه.

| ملف | امتى |
|-----|------|
| الملف ده | الخريطة والجدول |
| [02-expressjs-node.md](./02-expressjs-node.md) | أيام 6–12 |
| [03-postgresql-prisma.md](./03-postgresql-prisma.md) | أيام 13–19 |
| [04-platform-now.md](./04-platform-now.md) | يوم 0 (صورة سريعة) ويوم 20–21 (تطبيق) |
| `zads-app/src/types/index.ts` | أيام 1–5 |
| `zads-api/src/app.js` | أول ملف باك إند تفتحه |

---

## الجدول: 21 يوم، ساعتين في اليوم

حوالي **42 ساعة**. ده وقت قصير لحد frontend senior، ومش اختصار يخلّيك تحفظ فيديوهات. لو قدرت **3 ساعات في اليوم**، نفس الخطة في **14 يوم** (اجمع يومين في يوم).

متجمعش أسابيع الملفات التانية فوق بعض. `02` و `03` مكتوبين كمسار من الصفر لوحدهم. هنا أنت بتمشي أجزاء منهم بس.

يوم راحة كل أسبوع مسموح. لو وقفت، كمّل من آخر تمرين، متبدأش الكورس من الأول.

### يوم 0 — 45 دقيقة، قبل اليوم 1

اقرأ في [04-platform-now.md](./04-platform-now.md) قسم «المتصفح بيوصل للـ API إزاي» وقسم «عقود الخصوصية». عشان لما تكتب كود تعرف الطلب بيمشي فين، وإن رقم التليفون مش بيرجع في البحث العام.

---

### أيام 1–5 — TypeScript (10 ساعات)

أنت بتكتب TS في الواجهة. الفجوة مش `string` و `number`. الفجوة إن النوع يوصف **رد الـ API** و**جسم الطلب**، وإن TypeScript بيختفي وقت التشغيل فلازم Zod.

| اليوم | ساعتين | تعمل إيه |
|------|--------|----------|
| 1 | أنواع بتستخدمها فعلاً | افتح `zads-app/src/types/index.ts`. تتبّع `UserType` و `ContactRequestStatus` و `ApiResponse<T>`. اكتب بنفسك نوع لرد `GET /api/teachers/:id` من غير ما تنسخ الملف كله |
| 2 | تضييق الأنواع | union و `status === "accepted"` ليه بيغيّر النوع. اربطها بقاعدة الخصوصية: الرقم موجود في النوع بس بعد القبول |
| 3 | generics | `ApiResponse<T>` و `PaginatedResponse<T>`. اعمل دالة `apiGet<T>` في دماغك لحد ما تقدر تشرحها من غير ما تبص على `src/lib/api.ts` |
| 4 | Zod | التحقق وقت التشغيل. قارن validator في `zads-api/src/utils/validators.js` بنوع في الفرونت. النوع مش بيحمي السيرفر |
| 5 | تمرين قفل | اختَر endpoint واحد من `contactRequests`. اكتب الـ request type والـ response type في ملف تمرين عندك (متعملش commit إلا لو حابب). لو النوع يكذب على الكود، النوع غلط |

**فيديو (متكملش غير المطلوب):**

- [Beginner's TypeScript — Matt Pocock](https://www.totaltypescript.com/tutorials/beginners-typescript) — 18 تمرين فيديو مجاني. في اليوم 1 و 2 اعمل التمارين لحد union types و typing functions. لو التمرين سهل أوي، سيبه.
- [Zod — Total TypeScript](https://www.totaltypescript.com/tutorials/zod) — اليوم 4. 10 تمارين. زاد بتستخدم Zod في التحقق.
- [React with TypeScript](https://www.totaltypescript.com/tutorials/react-with-typescript) — **اختياري**. افتحه بس لو نوع الـ props لسه بيوجعك. مش جزء من الـ 10 ساعات.
- مرجع، مش كورس: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).

**خلصت الجزء ده لما:** تقدر تضيف حقل للنوع في `types/index.ts` وتعرف هو بيوصف رد السيرفر ولا بس شكل الواجهة.

---

### أيام 6–12 — Node.js و Express (14 ساعة)

الـ API مش TypeScript. هتفهم جافاسكربت السيرفر، وبعدين تقدر تكتبه TS بعدين. متتعلمش MongoDB. زاد PostgreSQL.

| اليوم | الساعات | الملف في زاد | المرحلة في [02](./02-expressjs-node.md) |
|------|---------|--------------|------------------------------------------|
| 6 | 2 | `zads-api/src/app.js` من أول الملف لحد `listen` | مرحلة 1: إزاي Node بيشغّل ملف، و `require`، والـ event loop |
| 7 | 2 | نفس `app.js`: ترتيب الـ middleware | مرحلة 2: Express، `app.use`، ليه الترتيب مهم |
| 8 | 2 | `src/middlewares/auth.js` و `src/middlewares/error.js` | مرحلة 3: `next()`، ومين بيمسك الخطأ |
| 9 | 2 | `src/routes/teachers.routes.js` + أول دالة في `teachers.controller.js` | مرحلة 4: route ثم controller ثم Prisma |
| 10 | 2 | `src/controllers/auth.controller.js` تسجيل الدخول | مرحلة 5: JWT. التوكن اللي الفرونت بيحطه في `Authorization` |
| 11 | 2 | `src/utils/validators.js` و `src/routes/auth.routes.js` | مرحلة 6: التحقق قبل ما الداتا تلمس الجدول |
| 12 | 2 | `contactRequests.controller.js` — إنشاء طلب وتغيير الحالة | مرحلة 7 بالقدر اللي يخص طلب التواصل بس. سيّب الباقي |

**فيديو:**

- [What the heck is the event loop?](https://www.youtube.com/watch?v=8aGhZQkoFbQ) — اليوم 6. حوالي 26 دقيقة. أهم فيديو Node قبل ما تكتب route. بعديه ارجع لـ `app.js`.
- [Node.js Crash Course — The Net Ninja](https://www.youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymONOKxwBU) — أيام 7–9. اتفرج الحلقات 1–6 و 8 و 10–11 (أساسيات، طلبات، npm، Express، middleware، router). **سيّب** حلقة الـ view engine وحلقة MongoDB. زاد مش بتستخدمهم.
- مرجع: [Node.js event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) و [Express routing](https://expressjs.com/en/guide/routing.html).

**خلصت الجزء ده لما:** تقدر تتبع `POST /api/contact-requests` من `app.js` لحد الرد، وتقول فين بيتفحص التوكن وفين بيتكتب الصف.

---

### أيام 13–19 — SQL ثم Prisma (14 ساعة)

Prisma مش بديل عن SQL. لو الاستعلام غريب، هتفتح SQL. اكتب الاستعلام بإيدك الأول، وبعدين شوف Prisma عاملاه إزاي.

| اليوم | الساعات | تعمل إيه |
|------|---------|----------|
| 13 | 2 | جداول، مفاتيح، `SELECT` / `WHERE`. ارسم جدول `users` من `schema.prisma` على ورقة |
| 14 | 2 | `JOIN`. اكتب SQL يجيب مدرس مع اسمه من `users` ومع منطقته من `areas` |
| 15 | 2 | واحد لمتعدد ومتعدد لمتعدد. `teacher_subjects` ليه جدول لوحده. المرحلة 3 في [03](./03-postgresql-prisma.md) |
| 16 | 2 | نفس استعلام اليوم 14 بـ Prisma في `teachers.controller.js` (`include` / `select`). مرحلة 4 |
| 17 | 2 | فهرس و `UNIQUE`. ليه `phone` فريد، وليه طلب التواصل المعلق ما يتكررش. بص على المايجريشن `20260926170000_contact_idempotency_and_analytics_funnel` |
| 18 | 2 | مايجريشن من غير ما تمسح داتا. مرحلة 5. اقرأ الفرق بين `migrate dev` و `migrate deploy`. متعملش reset |
| 19 | 2 | تمرين: استعلام «طلبات pending لمدرس معيّن من غير أرقام تليفون». اكتبه SQL، وبعدين دور على المكان في الكنترولر اللي بيمنع الرقم |

**فيديو:**

- [Learn SQL in 60 Minutes — Web Dev Simplified](https://www.youtube.com/watch?v=p3qvj9hO_Bo) — اليوم 13 و 14. الفيديو كله مرة واحدة، وبعدين التمارين بتاعته في وصف الفيديو. اللهجة SQL عامة وبتتنقل لـ PostgreSQL.
- [PostgreSQL Tutorial for Beginners — freeCodeCamp](https://www.youtube.com/watch?v=SpfIwlAYaKk) — أيام 15 و 17. حوالي 3 ساعات. **سيّب** تثبيت ويندوز. اتفرج: المفاتيح، العلاقات، الـ join، والقيود. وقف الفيديو واكتب الاستعلام على سكيمة زاد.
- تمارين قصيرة من غير فيديو: [pgexercises.com](https://pgexercises.com/) — 30–40 دقيقة في اليوم 15. اختَر joins.
- Prisma من غير كورس طويل: [Prisma docs — queries](https://www.prisma.io/docs/orm/prisma-client/queries/crud). اقرأها يوم 16 وانت فاتح الكنترولر.

**خلصت الجزء ده لما:** استعلام فيه join تقدر تكتبه SQL وتترجمه لـ Prisma من غير ما تنسخ مثال قديم سطر بسطر.

---

### أيام 20–21 — إثبات إن المسار قفل (4 ساعات)

متتفرجش فيديو جديد. اختر **طلب تواصل واحد** من الواجهة لحد الصف:

1. الصفحة في `zads-app` والـ store.
2. النداء في `src/lib/api.ts` والبروكسي `src/app/api/[...backend]/route.ts`.
3. الراوت والكنترولر في `zads-api`.
4. الجدول `contact_requests` والحالة `pending → accepted`.
5. امتى الرقم يظهر وامتى لأ. القواعد في [04-platform-now.md](./04-platform-now.md).

اكتب الصفحة دي في نوت عندك في نص صفحة. لو وقفت في حتة، الحتة دي هي اللي لسه محتاجة يوم، مش كورس جديد.

---

## امتحان آخر المسار

تقدر تقول نعم على الخمسة دول من غير ما تفتح ملف:

1. ليه نوع TypeScript مش كفاية عشان ترفض طلب بايظ على السيرفر؟
2. إيه ترتيب middleware في `app.js`، وإيه اللي بيحصل لو `auth` اتحط بعد الراوت؟
3. اكتب `JOIN` بين `teachers` و `users` و `areas`.
4. إيه الفرق بين طلب تواصل `pending` و `accepted` بالنسبة لرقم التليفون؟
5. إزاي تضيف عمود من غير ما تمسح قاعدة مشتركة؟

لو الخمسة واضحين، أنت fullstack على الستاك ده: تقدر تغيّر API وجدول ونوع في الفرونت في نفس الشغل. مش مطلوب تبقى مدير قواعد بيانات.

---

## اللي متعملوش

- متبدأش بـ React ولا بـ `01-nextjs-react.md` إلا لو حتة Next.js 16 نفسها واقفاك (البروكسي أو `proxy.ts`).
- متشوفش كورس Mongo أو MERN. هيبعدك عن PostgreSQL.
- متكملش كورس 8 ساعات. الجدول فوق بيحدد الحلقات.
- متجمعش «3 أسابيع Node» + «3 أسابيع SQL» من عناوين الملفات القديمة. المسار هنا هو الوقت.

</div>
