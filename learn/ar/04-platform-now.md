# 🚀 زاد دلوقتي — المنصة عاملة إيه في الكود

> **الهدف:** تربط المنتج الحالي بالكود. الملفات 01–03 بتعلم Next.js و Express و Prisma. الملف ده طبقة المنتج اللي اتبنت فوق الستاك: اكتشاف المدرسين، الخصوصية، قواعد التواصل، التحليلات، والـ proxy على نفس الأصل.

دليل المنتج الكامل في [DOCUMENTATION.md](../../DOCUMENTATION.md). اقرأ الملف ده في مسار التعلم، وارجع للدليل لما تحتاج جدول المسارات كامل.

---

## 📌 قواعد المنتج اللي الكود بيفرضها

**زاد منصة تواصل مباشر، مش سنتر.** المدرس هو اللي يحدد سعره. المنصة مش بتاخد عمولة من ثمن الحصة.

الإطلاق الجغرافي **٦ أكتوبر** و**الشيخ زايد**، والصفحات بالعربي والإنجليزي (`/ar` و `/en`).

أي حد يقدر يتصفح المدرسين قبل ما يعمل حساب. الحسابات في الداتابيز لسه تلات أدوار:

| الدور في الكود | الاسم في الواجهة | بيعمل إيه |
|----------------|------------------|-----------|
| `parent` | عميل / متعلم | بحث، مفضلة، أولاد، طلبات تواصل، «محتاج مدرس» |
| `teacher` | مدرس | بروفايل، مواد وأسعار، مواعيد الأسبوع، الطلبات الواردة |
| `admin` | أدمن | توثيق المدرسين، إيقاف الحسابات، مراجعة الطلبات |

حساب العميل يا `student` يا `guardian` (`Parent.clientAccountKind`). طلب «محتاج مدرس» ممكن يكون لـ `self` أو لـ `dependent`.

مكان الحصة مش هو نفسه «أونلاين ولا حضوري»:

| الحقل | القيم | المعنى |
|-------|-------|--------|
| `studyMode` | `online`, `offline`, `both` | طريقة التقديم |
| `teachingPlace` / `LessonType` | `at_teacher`, `at_student`, `group`, `online` | المكان |
| أسعار `TeacherSubject` | `priceOnline`, `priceOffline`, `priceAtTeacher`, `priceAtStudent`, `priceGroup` | سعر كل خيار |

---

## 🌐 الموقع العام (من غير تسجيل)

الصفحات تحت `zads-app/src/app/[locale]/public/`.

| الصفحة | المسار | ليه موجودة |
|--------|--------|------------|
| الرئيسية | `/public` | فكرة الجيرة التعليمية وبداية الاستخدام |
| بحث المدرسين | `/public/teachers` | فلاتر وبطاقات من غير حساب |
| بروفايل مدرس | `/public/teachers/[id]` | النبذة والمواد والأسعار وشارة التوثيق. الرقم مش بيرجع |
| انضم كمدرس | `/public/join-teacher` | شرح صفر عمولة ودعوة للتسجيل |
| عنّا / إزاي بتشتغل | `/public/about`, `/public/how-it-works` | الرسالة وخطوات التواصل التلاتة |
| صفحات المناطق | `/public/areas/6th-of-october`, `/public/areas/sheikh-zayed` | صفحات محلية لمحركات البحث |
| الشروط / الخصوصية / تواصل | `/public/terms`, `/public/privacy`, `/public/contact` | السياسات والدعم |

البحث والبروفايل العام بينادوا `GET /api/teachers` و `GET /api/teachers/:id`. الردود دي لازم متحتويش على أرقام تليفون.

أدوات الظهور في البحث:

- `zads-app/src/app/sitemap.ts` — روابط عامة للغتين
- `zads-app/src/app/robots.ts` — قواعد الزحف
- ملفات `layout.tsx` جنب الصفحات العامة بتحدد العنوان والوصف

الروابط القديمة لسه شغالة. `next.config.ts` بيحول `/parent/*` إلى `/client/*`، وصفحات التسويق القديمة إلى `/public/*`، والمسارات المكررة زي `/client/client` ترجع لـ `/client`.

---

## 🔒 عقود الخصوصية

دي سلوك منتج، مش تعليقات.

1. **الاكتشاف العام** بيرجع الاسم والصورة والنبذة والمواد والأسعار والمواعيد. مش بيرجع رقم المدرس.
2. **الشهادات** مش ملفات عامة. صاحبها والأدمن بس يقدروا يفتحوها.
3. **أرقام التواصل متخفية** طول ما الطلب `pending` أو `rejected`. الطرفين يشوفوا الأرقام بس لما `status === 'accepted'`.
4. **اللي بدأ الطلب مش يقدر يقبله أو يرفضه.** الطرف التاني هو اللي يقرر.
5. **طلب pending تاني** بين نفس العميل ونفس المدرس ونفس المادة بيرجع `409`. في كمان unique index جزئي على الصفوف المعلقة، و`idempotencyKey` اختياري عشان الدبل كليك ميعملش صفّين.

أرقام الموبايل المصرية (`010` و`011` و`012` و`015`، بـ `+20` أو من غيره) بتتظبط لصيغة `01xxxxxxxxx` قبل البحث أو الحفظ. تغيير كلمة السر محتاج كلمة السر الحالية.

اقرأ ده في:

- `zads-api/src/controllers/teachers.controller.js` — اختيار الحقول العامة من غير رقم
- `zads-api/src/controllers/contactRequests.controller.js` — آلة الحالات وإظهار الرقم
- `zads-api/src/utils/validators.js` — تطبيع الرقم
- `zads-api/tests/z04-z08-privacy-contracts.test.js` — العقود كاختبارات

---

## 🔁 المتصفح بيوصل للـ API إزاي

المتصفح بيكلم Next.js على بورت **3001**. Express على بورت **3000**. الطلبات من نفس الأصل بتمر على route handler، مش على rewrite في `next.config.ts`.

```
المتصفح  →  /api/teachers/search
         →  zads-app/src/app/api/[...backend]/route.ts
         →  Express  API_BASE_URL/api/teachers/search
         →  Prisma  →  PostgreSQL
```

الـ handler ده:

- بيمرر `/api/*` ما عدا `/api/auth/*` (NextAuth مالك المصادقة).
- بيشيل هيدر `Cookie` عشان كوكي جلسة NextAuth متروحش للـ API. التوكن بيروح في `Authorization`.
- بيشيل هيدرز Helmet والضغط من رد السيرفر عشان المتصفح ميفشلش في فك الجسم.

`next.config.ts` لسه مسؤول عن استضافة الصور والتحويلات القديمة. مش بيعمل proxy للـ API.

حماية الصفحات في `zads-app/src/proxy.ts`: `/client` محتاج `parent`، و`/teacher` محتاج `teacher`، و`/admin` محتاج `admin`.

---

## 📊 التحليلات والإسناد

طبقتين، عن قصد.

**Google Analytics 4** في المتصفح (`zads-app/src/lib/analytics.ts` و `GoogleAnalytics.tsx`):

- معرّف القياس من `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- الأحداث: `sign_up_teacher` و `sign_up_parent` و `contact_request` و `contact_support` و `view_teacher_profile` و `join_teacher_cta`
- سكربت gtag بيتحمّل في الـ head عشان الجمع يبدأ من أول مشاهدة

**أحداث المنصة** في Postgres (`PlatformEvent`، جدول `platform_events`):

| المسار | المصادقة | بيخزن إيه |
|--------|----------|-----------|
| `POST /api/analytics/event` | اختياري | حدث في القمع، والجلسة، والمستخدم لو موجود |
| `POST /api/analytics/attribution` | اختياري | الحملة أو مصدر الزيارة (`AttributionTracker.tsx`) |
| `POST /api/analytics/contact-click` | مسجّل | ضغطة تواصل حقيقية |
| `POST /api/analytics/whatsapp-click` | اختياري | ضغطة واتساب، وبتتسجل كمان في `whatsapp_clicks` |

`dedupKey` فريد عشان نفس الحدث ما يتسجلش مرتين.

---

## 🔔 الإشعارات والأدمن والرفع

- المدرس والعميل يقدروا يخزنوا توكن FCM: `POST /api/auth/fcm-token` و `POST /api/notifications/register-token`.
- Service worker المتصفح: `zads-app/public/firebase-messaging-sw.js`. `PushNotificationRegistrar.tsx` بيسجله بعد الدخول.
- الأدمن بيوثّق المدرس بـ `PATCH /api/admin/teachers/:teacherId/verify` (`isVerified` و `verifiedAt` و `verifiedBy` و `verificationNotes`).
- الأدمن بيراجع طلبات التواصل في `/admin/contact-requests`.
- الصور والشهادات بترفع عبر `POST /api/upload/image` و `POST /api/upload/certificate`.

---

## 🗄️ إضافات السكيمة اللي مش في الفصول الأولى

`schema.prisma` فيه **19 موديل**. التاسع عشر هو `PlatformEvent`.

`ContactRequest` كمان شايل حقول التنسيق:

`replyMessage` و `initiatedBy` و `studyMode` و `teachingPlace` و `preferredTime` و `tutorRequestId` و `idempotencyKey`.

آخر المايجريشنز:

- `20260926160000_complete_platform_contracts` — التوثيق، وطريقة الدراسة، ومكان الحصة، والمواعيد، ونوع الحساب
- `20260926170000_contact_idempotency_and_analytics_funnel` — `idempotency_key` و `platform_events` وطلب معلّق واحد لكل عميل/مدرس/مادة

طبّقهم بـ `npx prisma migrate deploy`. متعملش reset لداتابيز مشتركة عشان «تلحق».

الاختبارات اللي بتقفل السلوك ده في `zads-api/tests/` (`z03-admin-contracts` و `z04-z08-privacy-contracts` و `e2e-complete-flow`). صفحات العامة ليها سكربت في `zads-app/tests/public-discovery.cjs`.

---

## 🗺️ تفتح إيه لما تغيّر ميزة

| لو بتغيّر… | افتح… |
|------------|--------|
| صفحة عامة أو نص SEO | `zads-app/src/app/[locale]/public/` و `src/i18n/locales/{en,ar}.json` |
| البحث أو كارت المدرس | `teachers.controller.js` و `src/stores/search.ts` |
| مين يشوف رقم التليفون | `contactRequests.controller.js` واختبارات الخصوصية |
| نداء API من لوحة | `src/lib/api.ts` و `src/app/api/[...backend]/route.ts` |
| جدول أو عمود جديد | `schema.prisma` وبعدين فولدر جديد تحت `prisma/migrations/` |

---

## ⏭️ كده لحقنا المنصة

1. 📗 [01-nextjs-react.md](./01-nextjs-react.md) — App Router والستورز والمصادقة والترجمة
2. 📙 [02-expressjs-node.md](./02-expressjs-node.md) — المسارات والـ middleware والكنترولرز
3. 📘 [03-postgresql-prisma.md](./03-postgresql-prisma.md) — السكيمة والعلاقات و Neon
4. 🚀 الملف ده — المنصة زي ما بتتنشر النهارده

التفاصيل الزيادة عن مسار التعلم: [DOCUMENTATION.md](../../DOCUMENTATION.md).
