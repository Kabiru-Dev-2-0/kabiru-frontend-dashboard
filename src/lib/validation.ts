import type { ZodError } from "zod";
import type { ApiErrorDetail } from "@/types/auth";

export function formatZodError(error: ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "body",
    reason: issue.message,
  }));
}
