import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { isAuthorRole, type AuthorRole, type DashboardSessionUser } from "@/types/auth";

export const ACCESS_COOKIE_NAME = process.env.AUTH_COOKIE_ACCESS ?? "kabiru_dash_access_token";
export const REFRESH_COOKIE_NAME = process.env.AUTH_COOKIE_REFRESH ?? "kabiru_dash_refresh_token";
export const SESSION_META_COOKIE_NAME = "kabiru_dash_session";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 menit (sinkron dengan JWT auth-service)
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export interface CookieTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export function getCookieBaseOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: IS_PRODUCTION,
    path: "/",
    ...(typeof maxAge === "number" ? { maxAge } : {}),
  };
}

export function setAuthCookies(response: NextResponse, tokens: CookieTokenPair, sessionUser: DashboardSessionUser): void {
  const accessMaxAge = tokens.expiresIn && tokens.expiresIn > 0 ? tokens.expiresIn : ACCESS_TOKEN_MAX_AGE;

  response.cookies.set(ACCESS_COOKIE_NAME, tokens.accessToken, getCookieBaseOptions(accessMaxAge));
  response.cookies.set(REFRESH_COOKIE_NAME, tokens.refreshToken, getCookieBaseOptions(REFRESH_TOKEN_MAX_AGE));
  response.cookies.set(SESSION_META_COOKIE_NAME, JSON.stringify(sessionUser), getCookieBaseOptions(REFRESH_TOKEN_MAX_AGE));
}

export function setDemoSessionCookie(response: NextResponse, sessionUser: DashboardSessionUser): void {
  response.cookies.delete(ACCESS_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
  response.cookies.set(SESSION_META_COOKIE_NAME, JSON.stringify(sessionUser), getCookieBaseOptions(60 * 60 * 12));
}

export function updateSessionMetaCookie(response: NextResponse, sessionUser: DashboardSessionUser): void {
  response.cookies.set(SESSION_META_COOKIE_NAME, JSON.stringify(sessionUser), getCookieBaseOptions(REFRESH_TOKEN_MAX_AGE));
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(ACCESS_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
  response.cookies.delete(SESSION_META_COOKIE_NAME);
}

export async function readAuthCookies(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  sessionMeta: DashboardSessionUser | null;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value ?? null;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
  const rawMeta = cookieStore.get(SESSION_META_COOKIE_NAME)?.value ?? null;

  let sessionMeta: DashboardSessionUser | null = null;
  if (rawMeta) {
    try {
      const parsed = JSON.parse(rawMeta) as Partial<DashboardSessionUser>;
      if (parsed && typeof parsed.userId === "string" && typeof parsed.fullName === "string" && isAuthorRole(parsed.role)) {
        sessionMeta = {
          userId: parsed.userId,
          email: typeof parsed.email === "string" ? parsed.email : undefined,
          fullName: parsed.fullName,
          role: parsed.role,
          avatarUrl: typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : null,
          schoolName: typeof parsed.schoolName === "string" ? parsed.schoolName : null,
          isSimulated: Boolean(parsed.isSimulated),
        };
      }
    } catch {
      sessionMeta = null;
    }
  }

  return { accessToken, refreshToken, sessionMeta };
}

export function decodeJwtClaims(token: string): { userId?: string; role?: AuthorRole; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf-8")) as Record<string, unknown>;

    const userId = typeof payload.userId === "string" ? payload.userId : typeof payload.sub === "string" ? payload.sub : undefined;
    const role = isAuthorRole(payload.role) ? payload.role : undefined;
    const exp = typeof payload.exp === "number" ? payload.exp : undefined;

    return { userId, role, exp };
  } catch {
    return null;
  }
}

export function deriveDisplayNameFromEmail(email: string, role: AuthorRole): string {
  const localPart = email.split("@")[0]?.trim();
  if (!localPart) {
    return role === "admin" ? "Admin Kabiru" : role === "developer" ? "Developer Kabiru" : "Guru Kabiru";
  }

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
