/**
 * Authentication Helper Utilities
 *
 * Provides JWT token management including:
 * - Token extraction from requests
 * - Token validation
 * - Header generation
 * - Token parsing
 */

import { NextRequest } from "next/server";

// ==========================================================================
// TOKEN EXTRACTION
// ==========================================================================

/**
 * Extract session JWT from Next.js request
 *
 * Zero Trust Architecture:
 * - Uses the busibox-session cookie (RS256 JWT from authz)
 * - This is the actual authz session JWT, not a custom SSO token
 * - Can be exchanged for downstream service tokens via authz token exchange
 *
 * Checks Authorization header first, then busibox-session cookie
 */
export function getTokenFromRequest(request: NextRequest): string | undefined {
  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check busibox-session cookie (authz session JWT - shared across apps)
  const sessionCookie = request.cookies.get("busibox-session");
  if (sessionCookie) {
    return sessionCookie.value;
  }

  // Legacy fallback: check older cookie names
  const tokenCookie = request.cookies.get("auth_token");
  if (tokenCookie) {
    return tokenCookie.value;
  }

  const accessTokenCookie = request.cookies.get("access_token");
  if (accessTokenCookie) {
    return accessTokenCookie.value;
  }

  return undefined;
}

/**
 * Get session data from app-session cookie
 */
export function getSessionFromRequest(
  request: NextRequest
): { userId: string; email: string; roles: string[] } | null {
  const appName = process.env.APP_NAME || "app";
  const sessionCookie = request.cookies.get(`${appName}-session`);
  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    return {
      userId: session.userId || session.user_id,
      email: session.email,
      roles: session.roles || [],
    };
  } catch {
    return null;
  }
}

/**
 * Require token or throw authentication error
 */
export function requireToken(request: NextRequest): string {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new Error("Authentication token required");
  }
  return token;
}

// ==========================================================================
// HEADER GENERATION
// ==========================================================================

/**
 * Generate authorization headers for API requests
 */
export function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Generate headers for SSE requests
 */
export function getSSEHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// ==========================================================================
// TOKEN VALIDATION
// ==========================================================================

/**
 * Check if token is present (basic validation)
 */
export function hasToken(request: NextRequest): boolean {
  return getTokenFromRequest(request) !== undefined;
}

/**
 * Parse JWT token payload (without verification)
 * WARNING: This does NOT verify the signature. Use only for reading claims.
 */
export function parseJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to parse JWT payload:", error);
    return null;
  }
}

/**
 * Check if token is expired (based on exp claim)
 * WARNING: This does NOT verify the signature.
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWTPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  const payload = parseJWTPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return null;
  }

  return new Date(payload.exp * 1000);
}

/**
 * Get user ID from token
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = parseJWTPayload(token);
  if (!payload) {
    return null;
  }

  const sub = payload.sub;
  const userId = payload.user_id;
  
  if (typeof sub === "string") return sub;
  if (typeof userId === "string") return userId;
  return null;
}

/**
 * Get user roles from token
 */
export function getUserRolesFromToken(token: string): string[] {
  const payload = parseJWTPayload(token);
  if (!payload) {
    return [];
  }

  const roles = payload.roles || payload.role || [];

  if (!Array.isArray(roles)) {
    return typeof roles === "string" ? [roles] : [];
  }

  return roles.map((role: unknown) => {
    if (typeof role === "string") {
      return role;
    }
    if (role && typeof role === "object" && "name" in role) {
      return String((role as { name: unknown }).name);
    }
    return String(role);
  });
}

/**
 * Check if user has specific role
 */
export function hasRole(token: string, role: string): boolean {
  const roles = getUserRolesFromToken(token);
  return roles.includes(role);
}

/**
 * Check if user is admin
 */
export function isAdmin(token: string): boolean {
  return hasRole(token, "admin") || hasRole(token, "Admin");
}

// ==========================================================================
// TOKEN REFRESH
// ==========================================================================

/**
 * Check if token needs refresh (within buffer time of expiration)
 */
export function shouldRefreshToken(
  token: string,
  bufferMinutes: number = 5
): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return false;
  }

  const bufferMs = bufferMinutes * 60 * 1000;
  return Date.now() >= expiration.getTime() - bufferMs;
}

// ==========================================================================
// SCOPE VALIDATION
// ==========================================================================

/**
 * Get scopes from token
 */
export function getScopesFromToken(token: string): string[] {
  const payload = parseJWTPayload(token);
  if (!payload) {
    return [];
  }

  const scopes = payload.scope || payload.scopes || [];

  // Handle space-separated string (OAuth2 standard)
  if (typeof scopes === "string") {
    return scopes.split(" ").filter(Boolean);
  }

  return Array.isArray(scopes) ? scopes.map(String) : [];
}

/**
 * Check if token has specific scope
 */
export function hasScope(token: string, scope: string): boolean {
  const scopes = getScopesFromToken(token);
  return scopes.includes(scope);
}

/**
 * Check if token has all required scopes
 */
export function hasAllScopes(token: string, requiredScopes: string[]): boolean {
  const scopes = getScopesFromToken(token);
  return requiredScopes.every((scope) => scopes.includes(scope));
}
