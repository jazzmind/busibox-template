import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@jazzmind/busibox-app/lib/authz";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { getApiToken } from "@/lib/authz-client";
import { ensureDataDocuments, DOCUMENTS } from "@/lib/data-api-client";
import { syncAgents } from "@/lib/sync";

let agentsSynced = false;

async function ensureAgentsOnce(ssoToken: string): Promise<void> {
  if (agentsSynced) return;
  try {
    const agentToken = await getApiToken(ssoToken, "agent-api");
    const result = await syncAgents(agentToken);
    console.log("[setup] Agent sync:", result);
    agentsSynced = true;
  } catch (error) {
    console.warn("[setup] Agent sync failed (non-blocking):", error instanceof Error ? error.message : error);
  }
}

/**
 * GET /api/setup
 *
 * Returns initialization status and document IDs.
 * Also ensures agents are synced on first call.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, "data-api");
  if (auth instanceof NextResponse) return auth;
  const ids = await ensureDataDocuments(auth.apiToken);

  const sso = getTokenFromRequest(request);
  if (sso) {
    ensureAgentsOnce(sso).catch(() => {});
  }

  return NextResponse.json({
    initialized: true,
    documents: {
      notes: { name: DOCUMENTS.NOTES, id: ids.notes },
    },
  });
}

/**
 * POST /api/setup
 *
 * Ensures data documents exist. Call on first run to bootstrap the app.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, "data-api");
  if (auth instanceof NextResponse) return auth;

  const ids = await ensureDataDocuments(auth.apiToken);

  const sso = getTokenFromRequest(request);
  if (sso) {
    ensureAgentsOnce(sso).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    documents: {
      notes: { name: DOCUMENTS.NOTES, id: ids.notes },
    },
  });
}
