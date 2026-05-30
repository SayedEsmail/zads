// ─── API response wrapper ─────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Enums (mirror Prisma schema) ─────────────────────────────────────────

export type UserType = "teacher" | "parent" | "admin";

export type UserStatus = "active" | "suspended" | "deleted";

export type ContactRequestStatus = "pending" | "accepted" | "rejected";

export type TutorRequestStatus = "active" | "fulfilled" | "closed";

export type LessonType = "at_teacher" | "at_student" | "group" | "any";

/** PE-1: whether the client account is for self-learning or guardian */
export type ClientAccountKind = "student" | "guardian";

/** PE-1: whether the tutor request is for the client themselves or a dependent */
export type RequestTarget = "self" | "dependent";

/** PE-1: preferred mode of study */
export type StudyMode = "online" | "offline" | "both";

// ─── Core entities ────────────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  email?: string | null;
  name: string;
  avatarUrl?: string | null;
  userType: UserType;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  userId: string;
  bio?: string | null;
  experienceYears?: number | null;
  qualification?: string | null;
  areaId?: string | null;
  lessonTypes: LessonType[];
  isVerified: boolean;
  viewsCount: number;
  avgRating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  // Relations (included by API)
  user?: Pick<User, "id" | "name" | "phone" | "avatarUrl">;
  area?: Area & { city: City & { governorate: Governorate } };
  subjects?: TeacherSubject[];
  availabilities?: TeacherAvailability[];
}

/** Maps the API `Parent` model — product name: Client / Learner */
export interface ClientProfile {
  id: string;
  userId: string;
  areaId?: string | null;
  /** PE-1 */
  clientAccountKind: ClientAccountKind;
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: Pick<User, "id" | "name" | "phone" | "avatarUrl" | "userType">;
  area?: Area & { city: City & { governorate: Governorate } };
  children?: Dependent[];
}

/** Maps `ParentChild` model — product name: Dependent / تابع */
export interface Dependent {
  id: string;
  parentId: string;
  name: string;
  stageId: string;
  schoolType?: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  stage?: Stage;
  subjects?: Array<{ subject: Subject }>;
}

export interface Subject {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface Stage {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface TeacherSubject {
  id: string;
  teacherId: string;
  subjectId: string;
  stageId: string;
  priceAtTeacher?: number | null;
  priceAtStudent?: number | null;
  priceGroup?: number | null;
  /** PE-1 */
  priceOnline?: number | null;
  /** PE-1 */
  priceOffline?: number | null;
  priceNegotiable: boolean;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  // Relations
  subject?: Subject;
  stage?: Stage;
}

export interface TutorRequest {
  id: string;
  parentId: string;
  parentChildId?: string | null;
  subjectId: string;
  stageId: string;
  description?: string | null;
  preferredLessonType?: LessonType | null;
  /** PE-1 */
  requestTarget: RequestTarget;
  /** PE-1 */
  studyMode: StudyMode;
  budgetMin?: number | null;
  budgetMax?: number | null;
  areaId?: string | null;
  status: TutorRequestStatus;
  createdAt: string;
  expiresAt?: string | null;
  // Relations
  subject?: Subject;
  stage?: Stage;
  area?: Area;
  parentChild?: Dependent;
  parent?: { user: Pick<User, "name"> };
  contactCount?: number;
}

export interface ContactRequest {
  id: string;
  parentId: string;
  teacherId: string;
  subjectId?: string | null;
  stageId?: string | null;
  message?: string | null;
  replyMessage?: string | null;
  status: ContactRequestStatus;
  initiatedBy?: "parent" | "teacher";
  createdAt: string;
  updatedAt: string;
  // Relations
  teacher?: Pick<Teacher, "id"> & { user: Pick<User, "name" | "avatarUrl" | "phone"> };
  parent?: Pick<ClientProfile, "id"> & { user: Pick<User, "name" | "phone" | "avatarUrl"> };
  subject?: Subject;
  stage?: Stage;
}

export interface Favorite {
  id: string;
  parentId: string;
  teacherId: string;
  createdAt: string;
  teacher?: Teacher;
}

// ─── Location ─────────────────────────────────────────────────────────────

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface City {
  id: string;
  governorateId: string;
  nameAr: string;
  nameEn?: string | null;
  sortOrder: number;
  isActive: boolean;
  governorate?: Governorate;
}

export interface Area {
  id: string;
  cityId: string;
  nameAr: string;
  nameEn?: string | null;
  sortOrder: number;
  isActive: boolean;
  city?: City;
}

// ─── Auth payloads ────────────────────────────────────────────────────────

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterClientPayload {
  name: string;
  phone: string;
  password: string;
  clientAccountKind: ClientAccountKind;
  email?: string;
}

export interface RegisterTeacherPayload {
  name: string;
  phone: string;
  password: string;
  email?: string;
  bio?: string;
  lessonTypes?: LessonType[];
}

// ─── Admin stats ──────────────────────────────────────────────────────────

export interface AdminStats {
  totalTeachers: number;
  totalClients: number;
  totalRequests: number;
  activeSubjects: number;
}

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // e.g. "14:00"
  endTime: string;   // e.g. "18:00"
  createdAt: string;
}
