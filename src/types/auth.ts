import { z } from "zod";

export const USER_ROLES = ["student", "teacher", "admin", "developer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const AUTHORING_ROLES = ["teacher", "developer", "admin"] as const;
export type AuthorRole = (typeof AUTHORING_ROLES)[number];

export const EDUCATION_LEVEL_CODES = ["SD", "SMP", "SMA"] as const;
export type EducationLevelCode = (typeof EDUCATION_LEVEL_CODES)[number];

export function isAuthorRole(role: unknown): role is AuthorRole {
  return typeof role === "string" && (AUTHORING_ROLES as readonly string[]).includes(role);
}

export interface ActorContext {
  userId: string;
  role: UserRole;
  educationLevelCode?: EducationLevelCode | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiSuccessResponse<TData> {
  data: TData;
  meta: {
    requestId: string;
    pagination?: PaginationMeta;
  };
}

export interface ApiErrorDetail {
  field: string;
  reason: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  meta: {
    requestId: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: Extract<AuthorRole, "teacher" | "developer">;
}

export interface AuthSuccessResponse {
  userId: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  schoolName?: string | null;
  educationLevel?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  schoolName?: string | null;
  educationLevel?: EducationLevelCode | null;
}

export interface DashboardSessionUser {
  userId: string;
  email?: string;
  fullName: string;
  role: AuthorRole;
  avatarUrl?: string | null;
  schoolName?: string | null;
  isSimulated: boolean;
}

// ==========================================
// ZOD FORM & REQUEST VALIDATION SCHEMAS
// ==========================================

export const LoginFormSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").min(8, "Password minimal 8 karakter"),
});

export const RegisterFormSchema = z.object({
  fullName: z.string().trim().min(2, "Nama lengkap minimal 2 karakter").max(120, "Nama lengkap maksimal 120 karakter"),
  email: z.string().trim().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter").max(128, "Password maksimal 128 karakter"),
  role: z.enum(["teacher", "developer"], {
    errorMap: () => ({ message: "Role pendaftaran Studio hanya boleh 'teacher' atau 'developer'" }),
  }),
});

export const DemoLoginSchema = z.object({
  mode: z.literal("demo"),
  role: z.enum(AUTHORING_ROLES),
});

export const UpdateProfileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Nama lengkap minimal 2 karakter").max(120).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  avatarUrl: z.string().trim().url("Format URL avatar tidak valid").nullable().optional().or(z.literal("")),
  schoolName: z.string().trim().max(150).nullable().optional(),
  educationLevel: z.enum(EDUCATION_LEVEL_CODES).nullable().optional(),
});
