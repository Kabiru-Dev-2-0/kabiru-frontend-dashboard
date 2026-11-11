import type { NextRequest } from "next/server";
import { buildErrorJson, proxyAuthenticatedGateway } from "@/lib/bff-proxy";

const SAFE_SEGMENT_REGEX = /^[a-zA-Z0-9._-]+$/;

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function resolveGatewayGamePath(segments: string[], search: string): string | null {
  if (!Array.isArray(segments) || segments.length === 0 || segments.length > 5) {
    return null;
  }

  for (const segment of segments) {
    if (!SAFE_SEGMENT_REGEX.test(segment) || segment === "." || segment === "..") {
      return null;
    }
  }

  return `/game/${segments.join("/")}${search}`;
}

async function handleGameProxy(
  request: NextRequest,
  context: RouteContext,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
) {
  const { path } = await context.params;
  const gatewayPath = resolveGatewayGamePath(path, request.nextUrl.search);

  if (!gatewayPath) {
    return buildErrorJson(400, "VALIDATION_ERROR", "Path endpoint Game Module Studio tidak valid.");
  }

  let body: unknown = undefined;
  if (method === "POST" || method === "PATCH" || method === "PUT") {
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch {
      return buildErrorJson(400, "VALIDATION_ERROR", "Payload JSON request tidak valid.");
    }
  }

  const isPublicRead = method === "GET" && (path[0] === "templates" || path[0] === "player");

  return proxyAuthenticatedGateway(gatewayPath, {
    method,
    body,
    allowAnonymous: isPublicRead,
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleGameProxy(request, context, "GET");
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleGameProxy(request, context, "POST");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleGameProxy(request, context, "PATCH");
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleGameProxy(request, context, "PUT");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleGameProxy(request, context, "DELETE");
}
