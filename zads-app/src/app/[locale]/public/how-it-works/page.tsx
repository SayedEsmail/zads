import { useLocale } from "next-intl";

export default function HowItWorksPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const steps = isAr
    ? [
        { n: "1", title: "أنشئ حسابك", desc: "سجّل كعميل (لنفسك أو لأبنائك) أو كمعلم. يستغرق التسجيل أقل من دقيقة." },
        { n: "2", title: "ابحث عن معلم", desc: "استخدم فلاتر المادة والمرحلة والمنطقة وطريقة التعلم (أونلاين / أوفلاين) للعثور على المعلم المثالي." },
        { n: "3", title: "تواصل وانسّق", desc: "تواصل مع المعلم مباشرةً عبر المنصة، وحدد الموعد والتفاصيل." },
        { n: "4", title: "ابدأ رحلتك", desc: "ابدأ دروسك واستفد من تجربة تعليمية محلية وشخصية." },
      ]
    : [
        { n: "1", title: "Create your account", desc: "Sign up as a client (for yourself or your children) or as a teacher. Registration takes less than a minute." },
        { n: "2", title: "Find a tutor", desc: "Use filters for subject, stage, area, and study mode (online/offline) to find the perfect match." },
        { n: "3", title: "Connect & Coordinate", desc: "Message the tutor directly through the platform and set up your schedule." },
        { n: "4", title: "Start your journey", desc: "Begin your sessions and enjoy a personal, local learning experience." },
      ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-primary">
        {isAr ? "كيف يعمل زاد؟" : "How Zad Works"}
      </h1>
      <p className="mb-10 text-muted-foreground">
        {isAr
          ? "أربع خطوات بسيطة تفصلك عن بداية رحلتك التعليمية"
          : "Four simple steps to start your learning journey"}
      </p>

      <div className="space-y-5">
        {steps.map(({ n, title, desc }) => (
          <div key={n} className="flex items-start gap-5 rounded-2xl border border-border bg-surface p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
              {n}
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
