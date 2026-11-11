import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { deriveDisplayNameFromEmail, setAuthCookies, setDemoSessionCookie } from "@/lib/auth-cookies";
import { buildErrorJson, callGateway, extractGatewayError, normalizeGatewayEnvelope } from "@/lib/bff-proxy";
import { formatZodError } from "@/lib/validation";
import {
  DemoLoginSchema,
  isAuthorRole,
  LoginFormSchema,
  type AuthSuccessResponse,
  type DashboardSessionUser,
  type UserProfileResponse,
} from "@/types/auth";

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return buildErrorJson(400, "VALIDATION_ERROR", "Body JSON tidak valid.", undefined, requestId);
  }

  // Opsi Simulasi UI Offline (untuk preview dashboard saat backend Docker/microservices belum dijalankan)
  if (typeof rawBody === "object" && rawBody !== null && (rawBody as Record<string, unknown>).mode === "demo") {
    const parsedDemo = DemoLoginSchema.safeParse(rawBody);
    if (!parsedDemo.success) {
      return buildErrorJson(422, "VALIDATION_ERROR", "Data mode simulasi tidak valid.", formatZodError(parsedDemo.error), requestId);
    }

    const demoRole = parsedDemo.data.role;
    const demoNames = {
      teacher: "Rina Kartika (Simulasi Guru)",
      developer: "Achmad Soewardi (Simulasi Developer)",
      admin: "Admin Kabiru (Simulasi Admin)",
    } as const;

    const demoUser: DashboardSessionUser = {
      userId: `demo-${demoRole}-001`,
      email: `${demoRole}.demo@kabiru.id`,
      fullName: demoNames[demoRole],
      role: demoRole,
      isSimulated: true,
    };

    const res = NextResponse.json({ data: { user: demoUser }, meta: { requestId } }, { status: 200 });
    setDemoSessionCookie(res, demoUser);
    return res;
  }

  // Login normal via API Gateway (/v1/auth/login)
  const parsed = LoginFormSchema.safeParse(rawBody);
  if (!parsed.success) {
    return buildErrorJson(422, "VALIDATION_ERROR", "Data login tidak valid.", formatZodError(parsed.error), requestId);
  }

  const loginRes = await callGateway("/auth/login", {
    method: "POST",
    body: parsed.data,
    requestId,
  });

  if (!loginRes.ok) {
    const err = extractGatewayError(loginRes.json, loginRes.status, requestId);
    return NextResponse.json(err.body, { status: err.status });
  }

  const envelope = normalizeGatewayEnvelope<AuthSuccessResponse>(loginRes.json, requestId);
  const authData = envelope.data;

  if (!authData?.accessToken || !authData?.refreshToken) {
    return buildErrorJson(502, "GATEWAY_ERROR", "Respons login dari API Gateway tidak lengkap.", undefined, requestId);
  }

  // RBAC Guard: Role student dilarang masuk ke Dashboard Authoring/CMS
  if (!isAuthorRole(authData.role)) {
    return buildErrorJson(
      403,
      "FORBIDDEN",
      "Akun dengan role 'student' tidak memiliki izin mengakses Dashboard Studio & CMS. Silakan gunakan aplikasi LMS Siswa (port 3001).",
      [{ field: "role", reason: `Role '${authData.role}' ditolak oleh RBAC Dashboard` }],
      requestId,
    );
  }

  // Ambil profil user best-effort dari /v1/users/me (fallback ke klaim login bila user-service belum tersinkronisasi)
  let profileData: Partial<UserProfileResponse> | null = null;
  const profileRes = await callGateway("/users/me", {
    method: "GET",
    accessToken: authData.accessToken,
    requestId,
  });

  if (profileRes.ok) {
    profileData = normalizeGatewayEnvelope<UserProfileResponse>(profileRes.json, requestId).data;
  }

  const sessionUser: DashboardSessionUser = {
    userId: authData.userId,
    email: parsed.data.email.toLowerCase(),
    fullName: profileData?.fullName?.trim() || deriveDisplayNameFromEmail(parsed.data.email, authData.role),
    role: authData.role,
    avatarUrl: profileData?.avatarUrl ?? null,
    schoolName: profileData?.schoolName ?? null,
    isSimulated: false,
  };

  const response = NextResponse.json(
    {
      data: { user: sessionUser },
      meta: { requestId },
    },
    { status: 200 },
  );

  setAuthCookies(response, authData, sessionUser);
  return response;
}
