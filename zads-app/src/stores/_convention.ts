/**
 * Zustand Store Shape Convention
 *
 * Every store slice that fetches remote data follows this exact interface.
 * Do not deviate — this makes every page's loading/error pattern identical.
 */

export interface StoreSlice<T> {
  /** The fetched data. null before first fetch or after reset. */
  data: T | null;
  /** True while the API request is in-flight. */
  isLoading: boolean;
  /** Error message string or null. */
  error: string | null;
  /** Fetch (or re-fetch) data. Always sets isLoading=true, clears error, then sets data/error. */
  fetch: () => Promise<void>;
  /** Reset to initial state. Call on logout or when leaving the section. */
  reset: () => void;
}

/**
 * Helper: extract an error message from any thrown value.
 */
export function extractError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred";
}

/**
 * Initial slice state — use as the default value for every slice.
 */
export function initialSlice<T>(): Omit<StoreSlice<T>, "fetch" | "reset"> {
  return { data: null, isLoading: false, error: null };
}
