import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { clearAuthCookies, readAuthCookies, setAuthCookies, setDemoSessionCookie, updateSessionMetaCookie } from "@/lib/auth-cookies";
import { buildErrorJson, callGateway, extractGatewayError, normalizeGatewayEnvelope, refreshAccessTokenPair } from "@/lib/bff-proxy";
import { formatZodError } from "@/lib/validation";
import { UpdateProfileFormSchema, type DashboardSessionUser, type UserProfileResponse } from "@/types/auth";

export async function GET() {
  const requestId = randomUUID();
  const { accessToken, refreshToken, sessionMeta } = await readAuthCookies();

  if (sessionMeta?.isSimulated) {
    return NextResponse.json(
      {
        data: {
          id: sessionMeta.userId,
          userId: sessionMeta.userId,
          fullName: sessionMeta.fullName,
          avatarUrl: sessionMeta.avatarUrl ?? null,
          schoolName: sessionMeta.schoolName ?? "SMA Negeri 1 Kabiru (Simulasi)",
          educationLevel: "SMA",
          role: sessionMeta.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } satisfies UserProfileResponse,
        meta: { requestId },
      },
      { status: 200 },
    );
  }

  let activeToken = accessToken;
  let refreshed = null;
  if (!activeToken && refreshToken) {
    refreshed = await refreshAccessTokenPair(refreshToken, sessionMeta);
    activeToken = refreshed?.tokens.accessToken ?? null;
  }

  if (!activeToken) {
    return buildErrorJson(401, "UNAUTHENTICATED", "Silakan login terlebih dahulu.", undefined, requestId);
  }

  const profileRes = await callGateway("/users/me", {
    method: "GET",
    accessToken: activeToken,
    requestId,
  });

  if (!profileRes.ok) {
    // Jika user-service belum punya record profil (USER_PROFILE_NOT_FOUND), kembalikan fallback dari sessionMeta
    if (profileRes.status === 404 && sessionMeta) {
      const res = NextResponse.json(
        {
          data: {
            id: sessionMeta.userId,
            userId: sessionMeta.userId,
            fullName: sessionMeta.fullName,
            avatarUrl: sessionMeta.avatarUrl ?? null,
            schoolName: sessionMeta.schoolName ?? null,
            educationLevel: null,
            role: sessionMeta.role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } satisfies UserProfileResponse,
          meta: { requestId },
        },
        { status: 200 },
      );
      if (refreshed) {
        setAuthCookies(res, refreshed.tokens, refreshed.sessionUser);
      }
      return res;
    }

    const err = extractGatewayError(profileRes.json, profileRes.status, requestId);
    const errRes = NextResponse.json(err.body, { status: err.status });
    if (err.status === 401) clearAuthCookies(errRes);
    return errRes;
  }

  const normalized = normalizeGatewayEnvelope<UserProfileResponse>(profileRes.json, requestId);
  const res = NextResponse.json(normalized, { status: 200 });
  if (refreshed) {
    setAuthCookies(res, refreshed.tokens, refreshed.sessionUser);
  }
  return res;
}

export async function PATCH(request: NextRequest) {
  const requestId = randomUUID();
  const { accessToken, refreshToken, sessionMeta } = await readAuthCookies();

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return buildErrorJson(400, "VALIDATION_ERROR", "Body JSON tidak valid.", undefined, requestId);
  }

  const parsed = UpdateProfileFormSchema.safeParse(rawBody);
  if (!parsed.success) {
    return buildErrorJson(422, "VALIDATION_ERROR", "Data pembaruan profil tidak valid.", formatZodError(parsed.error), requestId);
  }

  const sanitizedBody = {
    ...parsed.data,
    ...(parsed.data.avatarUrl === "" ? { avatarUrl: null } : {}),
  };

  if (sessionMeta?.isSimulated) {
    const updatedDemo: DashboardSessionUser = {
      ...sessionMeta,
      fullName: sanitizedBody.fullName ?? sessionMeta.fullName,
      schoolName: sanitizedBody.schoolName !== undefined ? sanitizedBody.schoolName : sessionMeta.schoolName,
      avatarUrl: sanitizedBody.avatarUrl !== undefined ? sanitizedBody.avatarUrl : sessionMeta.avatarUrl,
    };

    const res = NextResponse.json(
      {
        data: {
          id: updatedDemo.userId,
          userId: updatedDemo.userId,
          fullName: updatedDemo.fullName,
          phone: sanitizedBody.phone ?? null,
          avatarUrl: updatedDemo.avatarUrl ?? null,
          schoolName: updatedDemo.schoolName ?? null,
          educationLevel: sanitizedBody.educationLevel ?? "SMA",
          role: updatedDemo.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } satisfies UserProfileResponse,
        meta: { requestId },
      },
      { status: 200 },
    );
    setDemoSessionCookie(res, updatedDemo);
    return res;
  }

  let activeToken = accessToken;
  let refreshed = null;
  if (!activeToken && refreshToken) {
    refreshed = await refreshAccessTokenPair(refreshToken, sessionMeta);
    activeToken = refreshed?.tokens.accessToken ?? null;
  }

  if (!activeToken) {
    return buildErrorJson(401, "UNAUTHENTICATED", "Sesi login telah berakhir.", undefined, requestId);
  }

  const updateRes = await callGateway("/users/me/profile", {
    method: "PATCH",
    body: sanitizedBody,
    accessToken: activeToken,
    requestId,
  });

  if (!updateRes.ok) {
    const err = extractGatewayError(updateRes.json, updateRes.status, requestId);
    const errRes = NextResponse.json(err.body, { status: err.status });
    if (err.status === 401) clearAuthCookies(errRes);
    return errRes;
  }

  const normalized = normalizeGatewayEnvelope<UserProfileResponse>(updateRes.json, requestId);
  const res = NextResponse.json(normalized, { status: 200 });

  if (sessionMeta) {
    const updatedMeta: DashboardSessionUser = {
      ...sessionMeta,
      fullName: normalized.data?.fullName ?? sanitizedBody.fullName ?? sessionMeta.fullName,
      avatarUrl: normalized.data?.avatarUrl ?? sessionMeta.avatarUrl,
      schoolName: normalized.data?.schoolName ?? sessionMeta.schoolName,
    };

    if (refreshed) {
      setAuthCookies(res, refreshed.tokens, updatedMeta);
    } else {
      updateSessionMetaCookie(res, updatedMeta);
    }
  }

  return res;
}
