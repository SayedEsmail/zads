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
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  const axiosErr = err as { response?: { data?: { message?: string } } };
  if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
  return "An unexpected error occurred";
}

