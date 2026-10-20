"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { postWithToken } from "@/lib/server-api";

// Mirrors what the client form sends; the Express controller stays the
// authority on business rules (teacher active, offer taught, idempotency).
const contactRequestSchema = z.object({
  locale: z.enum(["ar", "en"]),
  teacherId: z.string().trim().min(1, "Teacher ID is required"),
  subjectId: z.string().min(1).optional(),
  stageId: z.string().min(1).optional(),
  message: z.string().optional(),
  studyMode: z.enum(["online", "offline"]),
  preferredTime: z.string().optional(),
  idempotencyKey: z.string().min(1).max(200),
});

export type ContactRequestInput = z.input<typeof contactRequestSchema>;
export type ContactRequestResult =
  | { ok: true }
  | { ok: false; error: string; status?: number };

/** Same message precedence as stores/_convention.ts extractError for API bodies. */
function apiErrorMessage(body: { message?: string; errors?: Array<{ message?: string }> } | null, status: number) {
  if (body?.errors?.length && body.errors[0]?.message) {
    return body.errors.map((e) => e.message).filter(Boolean).join("; ") || body.message || "Validation error";
  }
  return body?.message ?? `Request failed with status code ${status}`;
}

export async function createContactRequest(input: ContactRequestInput): Promise<ContactRequestResult> {
  const parsed = contactRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation error", status: 400 };
  }

  const session = await auth();
  if (!session?.apiToken) {
    return { ok: false, error: "Authentication required", status: 401 };
  }

  const { locale, ...payload } = parsed.data;
  let res: Response;
  try {
    res = await postWithToken("/contact-requests", session.apiToken, payload);
  } catch {
    return { ok: false, error: "Network Error" };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, error: apiErrorMessage(body, res.status), status: res.status };
  }

  revalidatePath(`/${locale}/client/requests`);
  revalidatePath(`/${locale}/client/teacher/${payload.teacherId}`);
  return { ok: true };
}
