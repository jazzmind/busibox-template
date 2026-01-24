import { NextRequest, NextResponse } from "next/server";
import { validateSSOToken, createSessionFromSSO } from "@/lib/sso";

/**
 * SSO callback endpoint
 *
 * Handles SSO redirects from AI Portal.
 * Validates the token and sets up the session.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const returnUrl = searchParams.get("return") || "/";

  if (!token) {
    console.error("[SSO] No token provided");
    return NextResponse.redirect(new URL("/login?error=no_token", request.url));
  }

  try {
    // Validate the token
    const validation = await validateSSOToken(token);

    if (!validation.valid) {
      console.error("[SSO] Token validation failed:", validation.error);
      return NextResponse.redirect(
        new URL(`/login?error=${validation.error}`, request.url)
      );
    }

    // Create session data
    const session = createSessionFromSSO(validation);

    // Create response with redirect
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const redirectUrl = returnUrl.startsWith("/")
      ? `${basePath}${returnUrl}`
      : returnUrl;

    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    // Set session cookie
    const appName = process.env.APP_NAME || "app";
    response.cookies.set(`${appName}-session`, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Also set the busibox-session cookie with the token for subsequent requests
    response.cookies.set("busibox-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[SSO] Error:", error);
    return NextResponse.redirect(
      new URL("/login?error=sso_failed", request.url)
    );
  }
}

/**
 * SSO POST handler for token-based auth
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 400 }
      );
    }

    // Validate the token
    const validation = await validateSSOToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid token", details: validation.error },
        { status: 401 }
      );
    }

    // Create session data
    const session = createSessionFromSSO(validation);

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        roles: session.roles,
      },
    });

    // Set session cookies
    const appName = process.env.APP_NAME || "app";
    response.cookies.set(`${appName}-session`, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.set("busibox-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[SSO] POST Error:", error);
    return NextResponse.json(
      { error: "SSO failed" },
      { status: 500 }
    );
  }
}
