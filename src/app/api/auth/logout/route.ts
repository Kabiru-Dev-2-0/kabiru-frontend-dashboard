import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth-cookies";

export async function POST() {
  const requestId = randomUUID();
  const response = NextResponse.json({ data: { loggedOut: true }, meta: { requestId } }, { status: 200 });
  clearAuthCookies(response);
  return response;
}
