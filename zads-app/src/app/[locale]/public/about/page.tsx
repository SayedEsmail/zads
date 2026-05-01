import { useLocale } from "next-intl";

export default function AboutPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-primary">
        {isAr ? "من نحن" : "About Zad"}
      </h1>
      <div className="prose max-w-none text-foreground">
        {isAr ? (
          <>
            <p className="text-lg leading-relaxed text-muted-foreground">
              زاد هو منصة تعليمية محلية تربط المتعلمين بالمدرسين في نفس المنطقة.
              نؤمن أن التعليم الجيد يبدأ من الجوار — حيث يلتقي المدرس والطالب بسهولة،
              سواء أونلاين أو وجهاً لوجه.
            </p>
            <h2 className="mt-8 text-xl font-semibold">رسالتنا</h2>
            <p className="text-muted-foreground">
              جعل التعليم المحلي سهل الوصول والتنسيق لكل أسرة وكل متعلم،
              بغض النظر عن مستواه أو مادته أو طريقة تعلمه المفضلة.
            </p>
            <h2 className="mt-8 text-xl font-semibold">ما يميزنا</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>بحث جغرافي دقيق — العثور على مدرس في نفس الحي أو المدينة</li>
              <li>دروس أونلاين وأوفلاين — المرونة في اختيار الطريقة</li>
              <li>حساب واحد للمتعلم ولجميع تابعيه</li>
              <li>تقييمات حقيقية من طلاب سابقين</li>
            </ul>
          </>
        ) : (
          <>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Zad is a local learning platform that connects learners with tutors in the same area.
              We believe quality education starts in your neighborhood — where teacher and student
              can meet easily, whether online or face-to-face.
            </p>
            <h2 className="mt-8 text-xl font-semibold">Our Mission</h2>
            <p className="text-muted-foreground">
              Make local tutoring easy to find and coordinate for every family and every learner,
              regardless of their level, subject, or preferred study mode.
            </p>
            <h2 className="mt-8 text-xl font-semibold">What Sets Us Apart</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Geographic search — find a tutor in the same neighborhood or city</li>
              <li>Online & offline lessons — flexibility in how you learn</li>
              <li>One account for the learner and all their dependents</li>
              <li>Real ratings from previous students</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
