import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";
import { buildErrorJson, callGateway, extractGatewayError, normalizeGatewayEnvelope } from "@/lib/bff-proxy";
import { formatZodError } from "@/lib/validation";
import { isAuthorRole, RegisterFormSchema, type AuthSuccessResponse, type DashboardSessionUser } from "@/types/auth";

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return buildErrorJson(400, "VALIDATION_ERROR", "Body JSON tidak valid.", undefined, requestId);
  }

  const parsed = RegisterFormSchema.safeParse(rawBody);
  if (!parsed.success) {
    return buildErrorJson(422, "VALIDATION_ERROR", "Data pendaftaran akun Studio tidak valid.", formatZodError(parsed.error), requestId);
  }

  const registerRes = await callGateway("/auth/register", {
    method: "POST",
    body: parsed.data,
    requestId,
  });

  if (!registerRes.ok) {
    const err = extractGatewayError(registerRes.json, registerRes.status, requestId);
    return NextResponse.json(err.body, { status: err.status });
  }

  const envelope = normalizeGatewayEnvelope<AuthSuccessResponse>(registerRes.json, requestId);
  const authData = envelope.data;

  if (!authData?.accessToken || !authData?.refreshToken || !isAuthorRole(authData.role)) {
    return buildErrorJson(403, "FORBIDDEN", "Pendaftaran akun gagal memenuhi syarat role Studio.", undefined, requestId);
  }

  const sessionUser: DashboardSessionUser = {
    userId: authData.userId,
    email: parsed.data.email.toLowerCase(),
    fullName: parsed.data.fullName,
    role: authData.role,
    avatarUrl: null,
    schoolName: null,
    isSimulated: false,
  };

  const response = NextResponse.json(
    {
      data: { user: sessionUser },
      meta: { requestId },
    },
    { status: 201 },
  );

  setAuthCookies(response, authData, sessionUser);
  return response;
}
