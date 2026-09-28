import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format price: e.g. 200 → "200 ج" */
export function formatPrice(value: number | null | undefined, currency = "ج"): string {
  if (value == null) return "—";
  return `${value.toLocaleString()} ${currency}`;
}

/** Get initials from a full name: "Ahmed Ali" → "AA" */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/** Extract a human-readable error message from any thrown value */
export function extractError(err: unknown): string {
  if (err && typeof err === "object") {
    const axiosErr = err as {
      response?: { data?: { message?: string; errors?: Array<{ message?: string }> } };
      message?: string;
    };
    const data = axiosErr.response?.data;
    if (data?.errors?.length && data.errors[0]?.message) {
      return data.errors.map((e) => e.message).filter(Boolean).join("; ") || data.message || "Validation error";
    }
    if (data?.message) return data.message;
    if (typeof axiosErr.message === "string" && axiosErr.message) return axiosErr.message;
  }
  if (typeof err === "string") return err;
  return "An unexpected error occurred";
}

/**
 * Safely validate and sanitize internal redirect callback URLs.
 * Rejects external URLs, protocol tricks, protocol-relative '//', backslashes, etc.
 * Returns relative path or null if invalid/external.
 */
export function sanitizeInternalCallbackUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Must begin with a single slash, not '//' or '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return null;
  }

  // Reject explicit protocol schemes (javascript:, data:, https:, etc.)
  if (trimmed.includes("://") || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return null;
  }

  try {
    const dummyOrigin = "https://zads.app";
    const parsed = new URL(trimmed, dummyOrigin);
    if (parsed.origin !== dummyOrigin) {
      return null;
    }
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return null;
  }
}

