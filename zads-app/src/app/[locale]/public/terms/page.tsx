import { useLocale } from "next-intl";
import Link from "next/link";
import { FileText, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-start">
        <div className="space-y-2 border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <FileText className="h-3.5 w-3.5" />
            <span>{locale === "ar" ? "الشروط والأحكام" : "Terms of Service"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {locale === "ar" ? "شروط استخدام منصة زاد" : "Zads Terms of Service"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {locale === "ar" ? "آخر تحديث: سبتمبر 2026" : "Last updated: September 2026"}
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              {locale === "ar" ? "1. طبيعة المنصة ونطاق الخدمة" : "1. Nature of the Platform"}
            </h2>
            <p>
              {locale === "ar"
                ? "منصة زاد هي منصة تقنية تربط بين أولياء الأمور والطلاب من جهة، والمعلمين والمدربين المستقلين من جهة أخرى، لتسهيل التنسيق والتواصل المباشر للحصص والدروس التعليمية. زاد ليست مركزاً تعليمياً (سنتر) ولا تقدم خدمات تدريس مباشرة بذاتها، ويتم الاتفاق وتنسيق الحصص مباشرة بين الطرفين."
                : "Zads is a technology platform connecting independent tutors with parents and students for direct educational coordination. Zads is not an educational tutoring center and lesson agreements are coordinated directly between the parties."}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              {locale === "ar" ? "2. التزامات المعلمين والتوثيق" : "2. Teacher Obligations & Verification"}
            </h2>
            <p>
              {locale === "ar"
                ? "يلتزم المعلم بتقديم معلومات دقيقة وصحيحة حول مؤهلاته وخبراته. تمنح شارة التحقق (المعلم الموثق) للمعلمين بعد التحقق الإداري من وثيقة المؤهل الدراسي، دون أن يشكل ذلك ضماناً شاملاً للنتائج الأكاديمية."
                : "Educators agree to provide truthful credentials. The verified badge is granted after administrative document review without constituting an academic outcome guarantee."}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              {locale === "ar" ? "3. الاتفاق المالي وجدولة الحصص" : "3. Financial Agreements & Scheduling"}
            </h2>
            <p>
              {locale === "ar"
                ? "يتم الاتفاق المالي وتحديد أسعار الحصص ومواعيدها وطريقة الدفع مباشرة بين ولي الأمر والمعلم. المنصة لا تقدم خدمات معالجة مدفوعات داخلية ولا تتدخل في تسوية المعاملات المالية المباشرة بين الأطراف."
                : "Financial terms, session rates, schedules, and payment methods are agreed upon directly between parents and teachers. The platform does not process payments or intervene in direct settlements."}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              {locale === "ar" ? "4. سياسة الاستخدام المقبول" : "4. Acceptable Use"}
            </h2>
            <p>
              {locale === "ar"
                ? "يحظر استخدام المنصة لنشر بيانات مضللة، أو مضايقة المستخدمين، أو إرسال طلبات احتيالية. يحق لإدارة المنصة إيقاف أو تعليق أي حساب يخالف معايير النزاهة والاحترام المتبادل."
                : "Users must not post misleading data, spam, or abuse other users. Zads reserves the right to suspend any account violating community standards."}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              {locale === "ar" ? "5. التواصل والدعم" : "5. Contact & Support"}
            </h2>
            <p>
              {locale === "ar"
                ? "لأي استفسارات حول شروط الاستخدام، يمكنك التواصل معنا عبر صفحة التواصل أو البريد الإلكتروني المعتمد."
                : "For questions regarding these terms, please contact us via our contact page."}
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs">
          <Link href={`/${locale}/public`} className="text-primary hover:underline font-bold">
            {locale === "ar" ? "← العودة للرئيسية" : "← Back to Home"}
          </Link>
          <Link href={`/${locale}/public/privacy`} className="text-slate-600 hover:text-slate-900">
            {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
          </Link>
        </div>
      </div>
    </div>
  );
}
