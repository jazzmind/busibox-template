import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth-helper";
import { exchangeForAuthzToken, type AuthzAudience } from "@/lib/authz-client";

/**
 * Token exchange endpoint
 *
 * Exchanges SSO session JWT for a service-scoped access token.
 */
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: "No session token found" },
        { status: 401 }
      );
    }

    // Get target audience from request body
    const body = await request.json().catch(() => ({}));
    const audience = (body.audience || "backend-api") as AuthzAudience;
    const scopes = body.scopes as string[] | undefined;

    // Exchange token
    const result = await exchangeForAuthzToken(token, audience, scopes);

    return NextResponse.json({
      accessToken: result.accessToken,
      tokenType: result.tokenType,
      expiresIn: result.expiresIn,
      scope: result.scope,
    });
  } catch (error) {
    console.error("[Auth/Exchange] Error:", error);

    const message = error instanceof Error ? error.message : "Token exchange failed";

    return NextResponse.json(
      { error: "Token exchange failed", message },
      { status: 401 }
    );
  }
}
