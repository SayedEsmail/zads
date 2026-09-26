import { useLocale } from "next-intl";
import Link from "next/link";
import {
  GraduationCap,
  CheckCircle,
  Percent,
  Clock,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Users
} from "lucide-react";

export default function JoinTeacherPage() {
  const locale = useLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const benefits = [
    {
      icon: Users,
      title: locale === "ar" ? "استقلالية تامة في الاتفاق" : "Independent Direct Agreements",
      desc:
        locale === "ar"
          ? "تواصل مع المتعلمين وأسرهم لمناقشة احتياجات التعلم والتفاصيل مباشرةً."
          : "Connect with learners and their families to discuss learning needs and details directly.",
    },
    {
      icon: Users,
      title: locale === "ar" ? "تواصل مباشر مع أولياء الأمور" : "Direct Client Connection",
      desc:
        locale === "ar"
          ? "تعرّف على طلبات المتعلمين وتواصل معهم لمناقشة المواد والمواعيد المناسبة."
          : "Explore learner requests and connect to discuss subjects and suitable schedules.",
    },
    {
      icon: ShieldCheck,
      title: locale === "ar" ? "حالة التوثيق في الملف" : "Profile Verification Status",
      desc:
        locale === "ar"
          ? "أضف مؤهلاتك، وتظهر حالة التوثيق في ملفك بعد مراجعة المستندات."
          : "Add your qualifications; verification status appears on your profile after document review.",
    },
    {
      icon: Clock,
      title: locale === "ar" ? "مرونة كاملة في المواعيد والأسعار" : "Total Schedule & Rate Flexibility",
      desc:
        locale === "ar"
          ? "أضف الأسعار وطرق التعلم التي تقدمها وحدد أوقاتك المتاحة."
          : "Add your rates and learning formats, and set your available time slots.",
    },
  ];

  const steps = [
    {
      num: "1",
      title: locale === "ar" ? "أنشئ حسابك كمعلم" : "Create Teacher Account",
      desc:
        locale === "ar"
          ? "أنشئ حساباً باستخدام رقم هاتفك وبياناتك الأساسية."
          : "Create an account with your phone number and basic information.",
    },
    {
      num: "2",
      title: locale === "ar" ? "أضف المواد والمراحل وأسعارك" : "List Subjects & Rates",
      desc:
        locale === "ar"
          ? "حدد المواد التي تدرسها، المراحل الدراسية، وأسعارك المقترحة للحصص."
          : "Specify the subjects you teach, grade stages, and your hourly or session pricing.",
    },
    {
      num: "3",
      title: locale === "ar" ? "استقبل طلبات الدروس وابدأ" : "Receive Inquiries & Teach",
      desc:
        locale === "ar"
          ? "استكشف طلبات المتعلمين وتواصل مباشرةً لمناقشة احتياجاتهم."
          : "Explore learner requests and connect directly to discuss their needs.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <GraduationCap className="h-4 w-4" />
            {locale === "ar" ? "انضمام المعلمين والمدربين" : "Teacher Onboarding"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {locale === "ar"
              ? "شارك خبرتك وتواصل مع المتعلمين"
              : "Share your expertise and connect with learners"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {locale === "ar"
              ? "تساعد منصة زاد المعلمين على عرض ملفاتهم والتواصل مع المتعلمين لمناقشة فرص التعلم."
              : "Zads helps teachers share their profiles and connect with learners to discuss learning opportunities."}
          </p>
          <div className="pt-2">
            <Link
              href={`/${locale}/auth/register`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all"
            >
              <span>{locale === "ar" ? "أنشئ حساب معلم" : "Create a Teacher Account"}</span>
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">{b.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Steps Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-2xs space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              {locale === "ar" ? "كيف تبدأ مع منصة زاد في 3 خطوات بسيطة؟" : "How to start in 3 simple steps"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {locale === "ar" ? "خطوات واضحة وسريعة لا تتطلب سوى دقائق معدودة" : "Clear and quick setup within minutes"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.num}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 space-y-2 text-center md:text-start"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-xs">
                  {s.num}
                </span>
                <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final Registration Callout */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center text-white space-y-4 shadow-lg">
          <h2 className="text-2xl font-bold">
            {locale === "ar" ? "ابدأ بالتواصل مع المتعلمين" : "Start connecting with learners"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {locale === "ar"
              ? "أنشئ ملفك واستكشف طلبات التعلم المتاحة على المنصة."
              : "Create your profile and explore learning requests on the platform."}
          </p>
          <div>
            <Link
              href={`/${locale}/auth/register`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all"
            >
              <span>{locale === "ar" ? "إنشاء حساب معلم جديد" : "Create Teacher Account"}</span>
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
