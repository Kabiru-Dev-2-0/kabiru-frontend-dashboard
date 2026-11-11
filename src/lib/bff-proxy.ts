import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { clearAuthCookies, readAuthCookies, setAuthCookies } from "@/lib/auth-cookies";
import {
  isAuthorRole,
  type ApiErrorDetail,
  type ApiErrorResponse,
  type ApiSuccessResponse,
  type AuthSuccessResponse,
  type DashboardSessionUser,
  type PaginationMeta,
} from "@/types/auth";

export const API_GATEWAY_URL = (process.env.API_GATEWAY_URL ?? "http://localhost:3000/v1").replace(/\/+$/, "");

export function buildErrorJson(
  status: number,
  code: string,
  message: string,
  details?: ApiErrorDetail[],
  requestId: string = randomUUID(),
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && details.length > 0 ? { details } : {}),
      },
      meta: { requestId },
    },
    { status },
  );
}

/**
 * Defensive Pagination Adapter:
 * API Gateway `gameModuleForward` saat ini membungkus hasil service menjadi
 * `{ data: { items: [...], pagination: {...} }, meta: { requestId } }`.
 * Fungsi ini menormalkan baik bentuk nested tersebut maupun bentuk kanonik
 * `{ data: [...], meta: { requestId, pagination } }` agar client selalu menerima satu kontrak bersih.
 */
export function normalizeGatewayEnvelope<T = unknown>(payload: unknown, fallbackRequestId: string): ApiSuccessResponse<T> {
  if (typeof payload !== "object" || payload === null) {
    return {
      data: payload as T,
      meta: { requestId: fallbackRequestId },
    };
  }

  const record = payload as Record<string, unknown>;
  const rawMeta = typeof record.meta === "object" && record.meta !== null ? (record.meta as Record<string, unknown>) : {};
  const requestId = typeof rawMeta.requestId === "string" ? rawMeta.requestId : fallbackRequestId;
  const existingPagination = rawMeta.pagination as PaginationMeta | undefined;

  if ("data" in record) {
    const rawData = record.data;

    if (
      typeof rawData === "object" &&
      rawData !== null &&
      !Array.isArray(rawData) &&
      "items" in rawData &&
      Array.isArray((rawData as Record<string, unknown>).items)
    ) {
      const paginated = rawData as { items: unknown[]; pagination?: PaginationMeta };
      return {
        data: paginated.items as T,
        meta: {
          requestId,
          ...(paginated.pagination ?? existingPagination ? { pagination: paginated.pagination ?? existingPagination } : {}),
        },
      };
    }

    return {
      data: rawData as T,
      meta: {
        requestId,
        ...(existingPagination ? { pagination: existingPagination } : {}),
      },
    };
  }

  return {
    data: payload as T,
    meta: { requestId },
  };
}

export function extractGatewayError(payload: unknown, status: number, fallbackRequestId: string): {
  status: number;
  body: ApiErrorResponse;
} {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    const rawMeta = typeof record.meta === "object" && record.meta !== null ? (record.meta as Record<string, unknown>) : {};
    const requestId = typeof rawMeta.requestId === "string" ? rawMeta.requestId : fallbackRequestId;

    // 1. Format ApiErrorResponse resmi: { error: { code, message, details }, meta }
    if (typeof record.error === "object" && record.error !== null) {
      const errObj = record.error as Record<string, unknown>;
      return {
        status,
        body: {
          error: {
            code: typeof errObj.code === "string" ? errObj.code : "INTERNAL_ERROR",
            message: typeof errObj.message === "string" ? errObj.message : "Permintaan ke API Gateway gagal.",
            ...(Array.isArray(errObj.details) ? { details: errObj.details as ApiErrorDetail[] } : {}),
          },
          meta: { requestId },
        },
      };
    }

    // 2. Format NestJS exception mentah: { code, message } atau { statusCode, message }
    const message = Array.isArray(record.message)
      ? record.message.join(", ")
      : typeof record.message === "string"
        ? record.message
        : "Permintaan ke API Gateway gagal.";
    const code =
      typeof record.code === "string"
        ? record.code
        : status === 401
          ? "UNAUTHENTICATED"
          : status === 403
            ? "FORBIDDEN"
            : status === 404
              ? "NOT_FOUND"
              : "GATEWAY_ERROR";

    return {
      status,
      body: {
        error: { code, message },
        meta: { requestId },
      },
    };
  }

  return {
    status,
    body: {
      error: {
        code: "GATEWAY_ERROR",
        message: "API Gateway mengembalikan respons yang tidak dapat dibaca.",
      },
      meta: { requestId: fallbackRequestId },
    },
  };
}

export interface GatewayCallResult {
  ok: boolean;
  status: number;
  requestId: string;
  json: unknown;
}

export async function callGateway(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    accessToken?: string | null;
    requestId?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<GatewayCallResult> {
  const requestId = options.requestId ?? randomUUID();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_GATEWAY_URL}${normalizedPath}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "x-request-id": requestId,
    ...(options.headers ?? {}),
  };

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const hasBody = options.body !== undefined && options.method !== "GET" && options.method !== "DELETE";
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { message: text };
      }
    }

    return {
      ok: res.ok,
      status: res.status,
      requestId,
      json: parsed,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Network error";
    return {
      ok: false,
      status: 503,
      requestId,
      json: {
        error: {
          code: "DEPENDENCY_UNAVAILABLE",
          message: `API Gateway Kabiru (${API_GATEWAY_URL}) tidak dapat dihubungi (${errMsg}). Pastikan container atau server backend sudah berjalan.`,
        },
        meta: { requestId },
      },
    };
  }
}

export async function refreshAccessTokenPair(
  refreshToken: string,
  currentMeta: DashboardSessionUser | null,
): Promise<{ tokens: AuthSuccessResponse; sessionUser: DashboardSessionUser } | null> {
  const res = await callGateway("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });

  if (!res.ok) return null;

  const envelope = normalizeGatewayEnvelope<AuthSuccessResponse>(res.json, res.requestId);
  const authData = envelope.data;
  if (!authData?.accessToken || !authData?.refreshToken || !isAuthorRole(authData.role)) {
    return null;
  }

  const sessionUser: DashboardSessionUser = {
    userId: authData.userId,
    email: currentMeta?.email,
    fullName: currentMeta?.fullName ?? (authData.role === "admin" ? "Admin Kabiru" : authData.role === "developer" ? "Developer Kabiru" : "Guru Kabiru"),
    role: authData.role,
    avatarUrl: currentMeta?.avatarUrl ?? null,
    schoolName: currentMeta?.schoolName ?? null,
    isSimulated: false,
  };

  return { tokens: authData, sessionUser };
}

export async function proxyAuthenticatedGateway(
  gatewayPath: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    allowAnonymous?: boolean;
  } = {},
): Promise<NextResponse> {
  const { accessToken, refreshToken, sessionMeta } = await readAuthCookies();

  if (sessionMeta?.isSimulated) {
    return buildErrorJson(
      503,
      "SIMULATED_OFFLINE_SESSION",
      "Anda sedang berada di Mode Simulasi Offline tanpa backend. Masuk dengan akun backend aktif untuk melakukan sinkronisasi ke server.",
    );
  }

  let activeToken = accessToken;
  let refreshedSession: { tokens: AuthSuccessResponse; sessionUser: DashboardSessionUser } | null = null;

  // Jika access token kedaluwarsa/hilang dari cookie namun refresh token masih valid
  if (!activeToken && refreshToken) {
    refreshedSession = await refreshAccessTokenPair(refreshToken, sessionMeta);
    if (refreshedSession) {
      activeToken = refreshedSession.tokens.accessToken;
    }
  }

  if (!activeToken && !options.allowAnonymous) {
    return buildErrorJson(401, "UNAUTHENTICATED", "Sesi login tidak ditemukan atau telah kedaluwarsa. Silakan login kembali.");
  }

  let result = await callGateway(gatewayPath, {
    method: options.method ?? "GET",
    body: options.body,
    accessToken: activeToken,
  });

  // Auto-refresh sekali apabila gateway mengembalikan 401 dan refresh token tersedia
  if (result.status === 401 && refreshToken && !refreshedSession) {
    refreshedSession = await refreshAccessTokenPair(refreshToken, sessionMeta);
    if (refreshedSession) {
      activeToken = refreshedSession.tokens.accessToken;
      result = await callGateway(gatewayPath, {
        method: options.method ?? "GET",
        body: options.body,
        accessToken: activeToken,
      });
    } else {
      const errRes = buildErrorJson(401, "UNAUTHENTICATED", "Sesi login telah kedaluwarsa. Silakan login kembali.", undefined, result.requestId);
      clearAuthCookies(errRes);
      return errRes;
    }
  }

  if (!result.ok) {
    const normalizedErr = extractGatewayError(result.json, result.status, result.requestId);
    const errRes = NextResponse.json(normalizedErr.body, { status: normalizedErr.status });
    if (normalizedErr.status === 401) {
      clearAuthCookies(errRes);
    }
    return errRes;
  }

  const normalizedOk = normalizeGatewayEnvelope(result.json, result.requestId);
  const okRes = NextResponse.json(normalizedOk, { status: result.status });

  if (refreshedSession) {
    setAuthCookies(okRes, refreshedSession.tokens, refreshedSession.sessionUser);
  }

  return okRes;
}
