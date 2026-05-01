import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role="client" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
