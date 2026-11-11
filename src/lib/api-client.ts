import type { ApiErrorDetail, ApiErrorResponse, ApiSuccessResponse } from "@/types/auth";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetail[];
  readonly requestId?: string;

  constructor(params: { status: number; code: string; message: string; details?: ApiErrorDetail[]; requestId?: string }) {
    super(params.message);
    this.name = "ApiClientError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
    this.requestId = params.requestId;
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /**
   * Jika true, 401 tidak langsung mengarahkan browser ke `/login`
   * (berguna untuk form login atau pengecekan session awal).
   */
  skipUnauthorizedRedirect?: boolean;
}

export async function apiFetch<TData>(path: string, options: ApiFetchOptions = {}): Promise<ApiSuccessResponse<TData>> {
  const { body, headers, skipUnauthorizedRedirect = false, ...rest } = options;

  const normalizedPath = path.startsWith("/api") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  const hasJsonBody = body !== undefined && rest.method !== "GET" && rest.method !== "DELETE";
  if (hasJsonBody && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(normalizedPath, {
    ...rest,
    credentials: "same-origin",
    headers: requestHeaders,
    body: hasJsonBody ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const errPayload = parsed as Partial<ApiErrorResponse> | null;
    const code = errPayload?.error?.code ?? `HTTP_${response.status}`;
    const message = errPayload?.error?.message ?? `Permintaan gagal dengan status ${response.status}.`;
    const details = errPayload?.error?.details;
    const requestId = errPayload?.meta?.requestId;

    if (response.status === 401 && !skipUnauthorizedRedirect && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/login")) {
        window.location.assign(`/login?reason=session_expired&redirect=${encodeURIComponent(currentPath)}`);
      }
    }

    throw new ApiClientError({
      status: response.status,
      code,
      message,
      details,
      requestId,
    });
  }

  return (parsed ?? { data: null as TData, meta: { requestId: "" } }) as ApiSuccessResponse<TData>;
}
