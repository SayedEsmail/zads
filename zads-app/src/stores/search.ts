import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api, { publicApi } from "@/lib/api";
import { type StoreSlice, extractError, initialSlice } from "./_convention";
import type { Subject, Stage, Governorate, City, Area, Teacher, PaginatedResponse } from "@/types";

interface SearchFilters {
  subjectId?: string;
  stageId?: string;
  governorateId?: string;
  cityId?: string;
  areaId?: string;
  studyMode?: "online" | "offline" | "both";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

interface SearchStore {
  // Static data
  subjects: Subject[];
  stages: Stage[];
  governorates: Governorate[];
  cities: City[];
  areas: Area[];

  // Search results
  teachers: Teacher[];
  totalTeachers: number;
  totalPages: number;
  isLoadingTeachers: boolean;

  // Common loading/error
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSubjects: () => Promise<void>;
  fetchStages: () => Promise<void>;
  fetchGovernorates: () => Promise<void>;
  fetchCities: (governorateId: string) => Promise<void>;
  fetchAreas: (cityId: string) => Promise<void>;
  searchTeachers: (filters: SearchFilters, publicDiscovery?: boolean) => Promise<void>;
  reset: () => void;
}

export const useSearchStore = create<SearchStore>()(
  devtools(
    (set) => ({
      subjects: [],
      stages: [],
      governorates: [],
      cities: [],
      areas: [],
      teachers: [],
      totalTeachers: 0,
      totalPages: 0,
      isLoadingTeachers: false,
      isLoading: false,
      error: null,

      fetchSubjects: async () => {
        try {
          const res = await publicApi.get<{ data: Subject[] }>("/subjects");
          set({ subjects: res.data.data });
        } catch { /* silent */ }
      },

      fetchStages: async () => {
        try {
          const res = await publicApi.get<{ data: Stage[] }>("/stages");
          set({ stages: res.data.data });
        } catch { /* silent */ }
      },

      fetchGovernorates: async () => {
        try {
          const res = await publicApi.get<{ data: Governorate[] }>("/locations/governorates");
          set({ governorates: res.data.data });
        } catch { /* silent */ }
      },

      fetchCities: async (governorateId) => {
        try {
          const res = await publicApi.get<{ data: City[] }>(`/locations/cities?governorateId=${governorateId}`);
          set({ cities: res.data.data });
        } catch { /* silent */ }
      },

      fetchAreas: async (cityId) => {
        try {
          const res = await publicApi.get<{ data: Area[] }>(`/locations/areas?cityId=${cityId}`);
          set({ areas: res.data.data });
        } catch { /* silent */ }
      },

      searchTeachers: async (filters, publicDiscovery = false) => {
        set({ isLoadingTeachers: true, error: null });
        try {
          const res = await (publicDiscovery ? publicApi : api).get<PaginatedResponse<Teacher>>("/teachers", { params: filters });
          set({
            teachers: res.data.data,
            totalTeachers: res.data.pagination.total,
            totalPages: res.data.pagination.totalPages,
            isLoadingTeachers: false,
          });
        } catch (err) {
          set({ error: extractError(err), isLoadingTeachers: false });
        }
      },

      reset: () => set({
        teachers: [], totalTeachers: 0, totalPages: 0,
        isLoadingTeachers: false, isLoading: false, error: null,
      }),
    }),
    { name: "search-store" }
  )
);
