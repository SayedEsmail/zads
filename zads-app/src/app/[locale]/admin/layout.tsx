import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardSidebar role="admin" />
      <div className="flex flex-1">
        <main className="flex-1 p-4 md:p-6 md:ms-64 min-w-0">{children}</main>
      </div>
    </div>
  );
}
