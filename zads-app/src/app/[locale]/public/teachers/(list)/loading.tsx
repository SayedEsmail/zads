import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default function TeachersLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-36 rounded-2xl bg-primary/20 animate-pulse" />
        <PageSkeleton rows={4} />
      </div>
    </div>
  );
}
