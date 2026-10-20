import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default function AreaLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <PageSkeleton rows={5} />
      </div>
    </div>
  );
}
