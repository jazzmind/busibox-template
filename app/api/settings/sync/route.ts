/**
 * ============================================
 * DEMO FILE - DELETE WHEN BUILDING REAL APP
 * ============================================
 *
 * Agent sync API route.
 * GET: Returns sync status (which agents exist in agent-api)
 * POST: Triggers agent definition sync to agent-api
 */

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@jazzmind/busibox-app/lib/authz";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { getApiToken } from "@/lib/authz-client";
import { syncAgents, getSyncStatus } from "@/lib/sync";

export async function GET(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, "data-api");
  if (auth instanceof NextResponse) return auth;

  const sso = getTokenFromRequest(request);
  if (!sso) {
    return NextResponse.json({ error: "SSO token required" }, { status: 401 });
  }

  try {
    const agentToken = await getApiToken(sso, "agent-api");
    const status = await getSyncStatus(agentToken);
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get sync status", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, "data-api");
  if (auth instanceof NextResponse) return auth;

  const sso = getTokenFromRequest(request);
  if (!sso) {
    return NextResponse.json({ error: "SSO token required" }, { status: 401 });
  }

  try {
    const agentToken = await getApiToken(sso, "agent-api");
    const result = await syncAgents(agentToken);

    return NextResponse.json({ success: true, agents: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Sync failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
