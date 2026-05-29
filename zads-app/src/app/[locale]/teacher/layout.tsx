import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { useTranslations } from "next-intl";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const tCommon = useTranslations("common");
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardSidebar role="teacher" />
      <div className="flex flex-1">
        <main className="flex flex-1 flex-col p-4 md:p-6 md:ms-64 min-w-0">
          <div className="flex-1">{children}</div>
          <footer className="mt-8 text-center text-sm text-muted-foreground">
            {tCommon("copyright", { year: new Date().getFullYear() })}
          </footer>
        </main>
      </div>
    </div>
  );
}
