import { z } from "zod";

export const MAX_GAME_CONFIG_BYTES = 64 * 1024; // 64 KB batas aman JSONB config
export const MAX_MODULE_VERSION_BYTES = 5 * 1024 * 1024; // 5 MB batas total file per versi modul

export type ModuleSourceDto = "template" | "custom";
export type VersionStatusDto = "draft" | "published" | "archived";
export type ModuleStatusDto = "draft" | "active" | "disabled";

export function getJsonByteLength(value: unknown): number {
  const serialized = JSON.stringify(value);
  if (!serialized) return 0;
  return encodeURIComponent(serialized).replace(/%[A-F\d]{2}/g, "U").length;
}

export function isWithinJsonByteLimit(value: unknown, maxBytes: number): boolean {
  return getJsonByteLength(value) <= maxBytes;
}

// ==========================================
// 1. ZOD SCHEMAS (MIRROR @kabiru/contracts)
// ==========================================

export const ModuleSourceSchema = z.enum(["template", "custom"]);
export const VersionStatusSchema = z.enum(["draft", "published", "archived"]);
export const ModuleStatusSchema = z.enum(["draft", "active", "disabled"]);

export const RelativeFilePathSchema = z
  .string()
  .trim()
  .min(1, "Path file tidak boleh kosong")
  .max(255, "Path file maksimal 255 karakter")
  .regex(/^[a-zA-Z0-9._/-]+$/, "Path file hanya boleh memuat huruf, angka, titik (.), garis bawah (_), minus (-), dan slash (/)")
  .refine((p) => !p.startsWith("/") && !p.endsWith("/"), {
    message: 'Path file harus relatif (tidak boleh diawali atau diakhiri dengan "/")',
  })
  .refine((p) => !p.split("/").some((seg) => seg === ".." || seg === "." || seg.length === 0), {
    message: 'Path file dilarang memuat segmen traversal (".." atau "//")',
  });

export const ManifestSchema = z
  .object({
    schema_version: z.literal(1).default(1),
    name: z.string().trim().min(3, "Nama modul minimal 3 karakter").max(80, "Nama modul maksimal 80 karakter"),
    slug: z
      .string()
      .trim()
      .min(3, "Slug minimal 3 karakter")
      .max(100, "Slug maksimal 100 karakter")
      .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda minus (-)"),
    version: z.string().trim().regex(/^\d+\.\d+\.\d+$/, "Versi harus berformat semver x.y.z (contoh: 1.0.0)"),
    source: ModuleSourceSchema,
    template_id: z.string().trim().min(1).nullable().optional(),
    entry: z
      .object({
        html: RelativeFilePathSchema.default("index.html"),
        css: RelativeFilePathSchema.default("style.css").optional(),
        js: RelativeFilePathSchema.default("script.js").optional(),
      })
      .default({ html: "index.html", css: "style.css", js: "script.js" }),
    max_score: z.number().int().positive("max_score harus lebih besar dari 0").max(1000, "max_score maksimal 1000").default(100),
    config_schema: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((m) => (m.source === "template") === Boolean(m.template_id), {
    message: "template_id wajib diisi untuk source=template dan harus kosong untuk source=custom",
    path: ["template_id"],
  });

export const CreateGameModuleSchema = z
  .object({
    name: z.string().trim().min(3, "Nama modul minimal 3 karakter").max(150, "Nama modul maksimal 150 karakter"),
    slug: z
      .string()
      .trim()
      .min(3, "Slug minimal 3 karakter")
      .max(100, "Slug maksimal 100 karakter")
      .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda minus (-)")
      .optional(),
    description: z.string().trim().max(1000, "Deskripsi maksimal 1000 karakter").nullable().optional(),
    source: ModuleSourceSchema.default("template"),
    templateId: z.string().trim().min(1).nullable().optional(),
  })
  .refine((data) => (data.source === "template") === Boolean(data.templateId), {
    message: "templateId wajib diisi untuk source=template dan harus kosong untuk source=custom",
    path: ["templateId"],
  });

export const UpdateGameModuleSchema = z.object({
  name: z.string().trim().min(3, "Nama modul minimal 3 karakter").max(150).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  status: ModuleStatusSchema.optional(),
});

export const CreateGameVersionDraftSchema = z.object({
  moduleId: z.string().uuid("Format moduleId harus UUID valid"),
  version: z.string().trim().regex(/^\d+\.\d+\.\d+$/, "Versi harus berformat semver x.y.z (contoh: 1.0.0)"),
  config: z
    .record(z.string(), z.unknown())
    .default({})
    .refine((val) => isWithinJsonByteLimit(val, MAX_GAME_CONFIG_BYTES), {
      message: "Ukuran konfigurasi JSON melebihi batas 64 KB",
    }),
});

export const UpdateGameVersionConfigSchema = z.object({
  config: z.record(z.string(), z.unknown()).refine((val) => isWithinJsonByteLimit(val, MAX_GAME_CONFIG_BYTES), {
    message: "Ukuran konfigurasi JSON melebihi batas 64 KB",
  }),
});

export const SaveCustomFileItemSchema = z.object({
  relativePath: RelativeFilePathSchema,
  content: z.string(),
  encoding: z.enum(["utf8", "base64"]).default("utf8"),
  mimeType: z.string().trim().min(1).max(100).default("text/plain"),
  isEntrypoint: z.boolean().default(false),
});

export const SaveCustomFilesPayloadSchema = z.object({
  manifest: ManifestSchema.optional(),
  files: z
    .array(SaveCustomFileItemSchema)
    .min(1, "Minimal 1 file harus disertakan")
    .max(50, "Maksimal 50 file dalam satu versi modul"),
});

export const PublishGameVersionSchema = z.object({
  maxScore: z.number().int().positive().max(1000).default(100).optional(),
});

// ==========================================
// 2. RESPONSE DTO INTERFACES
// ==========================================

export type ManifestDto = z.infer<typeof ManifestSchema>;
export type CreateGameModuleDto = z.infer<typeof CreateGameModuleSchema>;
export type UpdateGameModuleDto = z.infer<typeof UpdateGameModuleSchema>;
export type SaveCustomFileItemDto = z.infer<typeof SaveCustomFileItemSchema>;

export interface GameTemplateListItemDto {
  id: string;
  name: string;
  description: string | null;
  configSchema: Record<string, unknown>;
  defaultConfig: Record<string, unknown>;
  isActive: boolean;
}

export interface GameTemplateDetailDto extends GameTemplateListItemDto {
  createdAt: string;
}

export interface GameModuleListItemDto {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  source: ModuleSourceDto;
  templateId: string | null;
  templateName: string | null;
  status: ModuleStatusDto;
  createdBy: string;
  latestVersion: string | null;
  latestVersionStatus: VersionStatusDto | null;
  publishedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GameModuleVersionSummaryDto {
  id: string;
  version: string;
  status: VersionStatusDto;
  publishedAt: string | null;
  publishedBy: string | null;
  createdAt: string;
}

export interface GameModuleDetailDto {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  source: ModuleSourceDto;
  templateId: string | null;
  templateName: string | null;
  status: ModuleStatusDto;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  versions: GameModuleVersionSummaryDto[];
}

export interface GameModuleFileItemDto {
  id: string;
  assetId: string;
  relativePath: string;
  isEntrypoint: boolean;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  storagePath: string;
  publicUrl?: string;
  content?: string;
}

export interface GameModuleVersionDetailDto {
  id: string;
  gameModuleId: string;
  moduleSlug: string;
  moduleName: string;
  source: ModuleSourceDto;
  templateId: string | null;
  version: string;
  status: VersionStatusDto;
  config: Record<string, unknown>;
  manifest: ManifestDto | Record<string, unknown> | null;
  checksumSha256: string | null;
  storagePrefix: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
  createdAt: string;
  files: GameModuleFileItemDto[];
}

export interface GamePlayerPayloadDto {
  versionId: string;
  gameModuleId: string;
  moduleSlug: string;
  moduleName: string;
  version: string;
  source: ModuleSourceDto;
  entrypoint: string;
  baseStorageUrl: string;
  config: Record<string, unknown>;
  maxScore: number;
  manifest: ManifestDto | Record<string, unknown>;
  files: Array<{
    relativePath: string;
    isEntrypoint: boolean;
    mimeType: string;
    publicUrl: string;
    content?: string;
  }>;
}

export interface MutationResultDto {
  id: string;
  deleted: boolean;
}
