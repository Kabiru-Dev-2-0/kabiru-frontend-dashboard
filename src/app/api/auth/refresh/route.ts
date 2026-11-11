import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { clearAuthCookies, readAuthCookies, setAuthCookies } from "@/lib/auth-cookies";
import { buildErrorJson, refreshAccessTokenPair } from "@/lib/bff-proxy";

export async function POST() {
  const requestId = randomUUID();
  const { refreshToken, sessionMeta } = await readAuthCookies();

  if (sessionMeta?.isSimulated) {
    return NextResponse.json({ data: { user: sessionMeta }, meta: { requestId } }, { status: 200 });
  }

  if (!refreshToken) {
    const res = buildErrorJson(401, "UNAUTHENTICATED", "Refresh token tidak ditemukan.", undefined, requestId);
    clearAuthCookies(res);
    return res;
  }

  const refreshed = await refreshAccessTokenPair(refreshToken, sessionMeta);
  if (!refreshed) {
    const res = buildErrorJson(401, "AUTH_INVALID_TOKEN", "Refresh token tidak valid atau kedaluwarsa.", undefined, requestId);
    clearAuthCookies(res);
    return res;
  }

  const response = NextResponse.json({ data: { user: refreshed.sessionUser }, meta: { requestId } }, { status: 200 });
  setAuthCookies(response, refreshed.tokens, refreshed.sessionUser);
  return response;
}
