import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { clearAuthCookies, decodeJwtClaims, readAuthCookies, setAuthCookies } from "@/lib/auth-cookies";
import { buildErrorJson, callGateway, normalizeGatewayEnvelope, refreshAccessTokenPair } from "@/lib/bff-proxy";
import { isAuthorRole, type DashboardSessionUser, type UserProfileResponse } from "@/types/auth";

export async function GET() {
  const requestId = randomUUID();
  const { accessToken, refreshToken, sessionMeta } = await readAuthCookies();

  // Mode Simulasi Offline
  if (sessionMeta?.isSimulated) {
    return NextResponse.json({ data: { user: sessionMeta }, meta: { requestId } }, { status: 200 });
  }

  if (!accessToken && !refreshToken) {
    return buildErrorJson(401, "UNAUTHENTICATED", "Belum ada sesi login aktif.", undefined, requestId);
  }

  let activeToken = accessToken;
  let activeUser = sessionMeta;
  let refreshedTokens: Parameters<typeof setAuthCookies>[1] | null = null;

  // Cek apakah access token sudah kedaluwarsa atau belum ada di cookie
  const claims = activeToken ? decodeJwtClaims(activeToken) : null;
  const isExpired = claims?.exp ? claims.exp * 1000 <= Date.now() + 5_000 : false;

  if (!activeToken || !claims || isExpired) {
    if (!refreshToken) {
      const errRes = buildErrorJson(401, "UNAUTHENTICATED", "Token sesi telah kedaluwarsa.", undefined, requestId);
      clearAuthCookies(errRes);
      return errRes;
    }

    const refreshed = await refreshAccessTokenPair(refreshToken, sessionMeta);
    if (!refreshed) {
      const errRes = buildErrorJson(401, "UNAUTHENTICATED", "Sesi login telah berakhir. Silakan login kembali.", undefined, requestId);
      clearAuthCookies(errRes);
      return errRes;
    }

    activeToken = refreshed.tokens.accessToken;
    activeUser = refreshed.sessionUser;
    refreshedTokens = refreshed.tokens;
  }

  const finalClaims = decodeJwtClaims(activeToken!);
  const role = finalClaims?.role ?? activeUser?.role;
  const userId = finalClaims?.userId ?? activeUser?.userId;

  if (!userId || !isAuthorRole(role)) {
    const errRes = buildErrorJson(403, "FORBIDDEN", "Akun tidak memiliki hak akses Dashboard Studio.", undefined, requestId);
    clearAuthCookies(errRes);
    return errRes;
  }

  // Best-effort sinkronisasi profil terbaru dari /v1/users/me (tidak gagal jika user-service kosong)
  let profileData: Partial<UserProfileResponse> | null = null;
  const profileRes = await callGateway("/users/me", {
    method: "GET",
    accessToken: activeToken,
    requestId,
  });

  if (profileRes.status === 401 && refreshToken && !refreshedTokens) {
    const refreshed = await refreshAccessTokenPair(refreshToken, activeUser);
    if (refreshed) {
      activeToken = refreshed.tokens.accessToken;
      activeUser = refreshed.sessionUser;
      refreshedTokens = refreshed.tokens;
    } else {
      const errRes = buildErrorJson(401, "UNAUTHENTICATED", "Sesi token tidak valid di server backend.", undefined, requestId);
      clearAuthCookies(errRes);
      return errRes;
    }
  } else if (profileRes.ok) {
    profileData = normalizeGatewayEnvelope<UserProfileResponse>(profileRes.json, requestId).data;
  }

  const resolvedUser: DashboardSessionUser = {
    userId,
    email: activeUser?.email,
    fullName:
      profileData?.fullName?.trim() ??
      activeUser?.fullName ??
      (role === "admin" ? "Admin Kabiru" : role === "developer" ? "Developer Kabiru" : "Guru Kabiru"),
    role,
    avatarUrl: profileData?.avatarUrl ?? activeUser?.avatarUrl ?? null,
    schoolName: profileData?.schoolName ?? activeUser?.schoolName ?? null,
    isSimulated: false,
  };

  const response = NextResponse.json({ data: { user: resolvedUser }, meta: { requestId } }, { status: 200 });
  if (refreshedTokens) {
    setAuthCookies(response, refreshedTokens, resolvedUser);
  }
  return response;
}
