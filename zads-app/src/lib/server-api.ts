import { cache } from "react";
import type { Subject, Stage, Governorate, Teacher, PaginatedResponse } from "@/types";

// Server-only reads straight from the Express API. Browser code keeps using
// the same-origin /api proxy (lib/api.ts); this module never runs there
// because API_BASE_URL is not exposed to the client bundle.
const API_BASE = (process.env.API_BASE_URL || "https://api.zads.app").replace(/\/$/, "");

/** Lookups change rarely; teacher search results can lag by a minute. */
const LOOKUP_REVALIDATE = 3600;
const SEARCH_REVALIDATE = 60;

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function getJson<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(body?.message ?? `API ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

/** Lookup lists for the filter panel. Failures degrade to an empty list, as the client store did. */
async function getLookup<T>(path: string, tag: string): Promise<T[]> {
  try {
    const res = await getJson<{ data: T[] }>(path, {
      next: { revalidate: LOOKUP_REVALIDATE, tags: [tag] },
    });
    return res.data;
  } catch {
    return [];
  }
}

export const getSubjects = () => getLookup<Subject>("/subjects", "subjects");
export const getStages = () => getLookup<Stage>("/stages", "stages");
export const getGovernorates = () => getLookup<Governorate>("/locations/governorates", "governorates");

export interface TeacherSearchParams {
  page?: number;
  subjectId?: string;
  stageId?: string;
  governorateId?: string;
  studyMode?: "online" | "offline";
  minPrice?: number;
  maxPrice?: number;
}

/** Anonymous discovery search: no token, so no account-specific filtering upstream. */
export function searchPublicTeachers(params: TeacherSearchParams) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  }
  const query = qs.toString();
  return getJson<PaginatedResponse<Teacher>>(`/teachers${query ? `?${query}` : ""}`, {
    next: { revalidate: SEARCH_REVALIDATE, tags: ["teachers"] },
  });
}

/**
 * Teacher profile. Not cached across requests: the API counts every read as a
 * profile view (viewsCount + platform event), so serving it from a cache would
 * silently drop views. cache() dedupes the page and generateMetadata calls.
 */
export const getTeacher = cache(async (id: string): Promise<Teacher | null> => {
  try {
    const res = await getJson<{ data: Teacher }>(`/teachers/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
});

/** Authenticated POST used by server actions; returns the raw response for caller-side error mapping. */
export function postWithToken(path: string, token: string, body: unknown) {
  return fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}
