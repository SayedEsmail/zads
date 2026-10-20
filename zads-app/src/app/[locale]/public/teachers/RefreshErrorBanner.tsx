"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

/** ErrorBanner whose retry re-runs the server render (onRetry cannot cross the RSC boundary). */
export function RefreshErrorBanner({ error }: { error: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <ErrorBanner
      error={error}
      onRetry={isPending ? undefined : () => startTransition(() => router.refresh())}
    />
  );
}
