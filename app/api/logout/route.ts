import { NextRequest, NextResponse } from "next/server";

/**
 * Logout endpoint
 *
 * Clears session cookies and returns success.
 */
export async function POST(request: NextRequest) {
  const appName = process.env.APP_NAME || "app";

  const response = NextResponse.json({ success: true });

  // Clear session cookies
  response.cookies.set(`${appName}-session`, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("busibox-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  // Clear legacy cookies
  response.cookies.set("auth_token", "", {
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("access_token", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
