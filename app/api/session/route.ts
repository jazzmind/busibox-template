import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, getUserIdFromToken, getUserRolesFromToken } from "@/lib/auth-helper";
import { validateSSOToken } from "@/lib/sso";

/**
 * Session endpoint
 *
 * Returns current user session information.
 */
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({
        user: null,
        isAuthenticated: false,
      });
    }

    // Validate the token
    const validation = await validateSSOToken(token);

    if (!validation.valid) {
      console.log("[Session] Token validation failed:", validation.error);
      return NextResponse.json({
        user: null,
        isAuthenticated: false,
        error: validation.error,
      });
    }

    // Get user info from token
    const userId = getUserIdFromToken(token);
    const roles = getUserRolesFromToken(token);

    return NextResponse.json({
      user: {
        id: userId || validation.userId,
        email: validation.email || "",
        status: "ACTIVE",
        roles: roles.length > 0 ? roles : validation.roles || [],
      },
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("[Session] Error:", error);
    return NextResponse.json({
      user: null,
      isAuthenticated: false,
      error: "Failed to get session",
    });
  }
}
