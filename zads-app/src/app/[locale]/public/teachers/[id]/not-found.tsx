import { getLocale } from "next-intl/server";
import { TeacherUnavailable } from "./TeacherUnavailable";

export default async function TeacherNotFound() {
  const locale = await getLocale();
  return <TeacherUnavailable locale={locale} error={locale === "ar" ? "المعلم غير موجود" : "Teacher not found"} />;
}
