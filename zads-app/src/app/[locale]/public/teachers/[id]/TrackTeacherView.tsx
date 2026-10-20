"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/** GA lives in the browser; fire the profile view once the server-rendered profile is shown. */
export function TrackTeacherView({ teacherId }: { teacherId: string }) {
  useEffect(() => {
    trackEvent("view_teacher_profile", { teacher_id: teacherId, source: "public" });
  }, [teacherId]);
  return null;
}
