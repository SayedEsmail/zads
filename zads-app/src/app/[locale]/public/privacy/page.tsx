import { useLocale } from "next-intl";
import Link from "next/link";
import { Shield, Lock, EyeOff, UserCheck } from "lucide-react";

export default function PrivacyPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-start">
        <div className="space-y-2 border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <Shield className="h-3.5 w-3.5" />
            <span>{locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {locale === "ar" ? "سياسة الخصوصية وحماية البيانات" : "Zads Privacy Policy"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {locale === "ar" ? "آخر تحديث: سبتمبر 2026" : "Last updated: September 2026"}
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-primary" />
              <span>{locale === "ar" ? "1. حماية أرقام الهواتف ووسائل الاتصال" : "1. Phone Number Masking"}</span>
            </h2>
            <p>
              {locale === "ar"
                ? "في منصة زاد، نحرص تماماً على خصوصية المعلمين والعائلات. لا يتم عرض أرقام الهواتف بشكل علني في نتائج البحث أو الملفات الشخصية العامة. يتم الكشف عن رقم هاتف الطرف الآخر فقط عند قبول طلب التواصل المشترك بين ولي الأمر والمعلم."
                : "At Zads, phone numbers are strictly protected. They are never shown in public search results or public profiles. Phone numbers are only revealed after a contact request is mutually accepted."}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>{locale === "ar" ? "2. حماية وثائق التوثيق والشهادات" : "2. Document Protection"}</span>
            </h2>
            <p>
              {locale === "ar"
                ? "وثائق التخرج والشهادات المرفوعة من قبل المعلمين لغايات التوثيق تخضع لحماية مشددة، ولا يمكن الوصول إليها من قبل المتصفحين العامين أو الأطراف الأخرى، بل تقتصر مراجعتها على فريق الإدارة المصرح له لغرض التحقق ومنح الشارة."
                : "Academic certificates uploaded for verification are secured against anonymous or public access and can only be accessed by authorized platform admins for credential auditing."}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>{locale === "ar" ? "3. بيانات الطلاب والأبناء" : "3. Student Information"}</span>
            </h2>
            <p>
              {locale === "ar"
                ? "البيانات المسجلة للأبناء تقتصر على السنة الدراسية ونوع التعليم (عام، لغات، إلخ) والملاحظات التعليمية لمساعدة المعلم، ولا يتم جمع أو مشاركة أي بيانات حساسة غير ضرورية للعملية التعليمية."
                : "Student records are strictly limited to academic stage and curriculum type to assist the teacher. No unnecessary or sensitive personal data is gathered or shared."}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              {locale === "ar" ? "4. عدم مشاركة البيانات مع جهات إعلانية" : "4. No Commercial Data Selling"}
            </h2>
            <p>
              {locale === "ar"
                ? "نحن لا نبيع ولا نؤجر بيانات المستخدمين لأي شركات إعلانية أو جهات تسويقية خارجية بأي شكل من الأشكال."
                : "We do not sell, rent, or trade your personal data with third-party advertisers or marketing agencies under any circumstances."}
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs">
          <Link href={`/${locale}/public`} className="text-primary hover:underline font-bold">
            {locale === "ar" ? "← العودة للرئيسية" : "← Back to Home"}
          </Link>
          <Link href={`/${locale}/public/terms`} className="text-slate-600 hover:text-slate-900">
            {locale === "ar" ? "الشروط والأحكام" : "Terms of Service"}
          </Link>
        </div>
      </div>
    </div>
  );
}
