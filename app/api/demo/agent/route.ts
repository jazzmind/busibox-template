/**
 * ============================================
 * DEMO FILE - DELETE WHEN BUILDING REAL APP
 * ============================================
 * 
 * This file is part of the busibox-template demo.
 * Delete this entire file when starting your real app.
 * 
 * See DEMO.md for complete deletion checklist.
 *
 * Demonstrates calling the agent-api via token exchange.
 * For production apps, use the /api/agent/[...path] catch-all proxy
 * or SimpleChatInterface with the /api/auth/token endpoint instead.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";

const AGENT_API_URL =
  process.env.AGENT_API_URL || "http://localhost:8000";

/**
 * POST /api/demo/agent
 * Demo endpoint that calls agent-api to test token exchange
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "agent-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const response = await fetch(`${AGENT_API_URL}/agents`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
        "Content-Type": "application/json",
      },
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DEMO] Agent API error:", response.status, errorText);
      
      return NextResponse.json(
        {
          error: "Agent API call failed",
          status: response.status,
          message: errorText,
          duration,
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: `Agent API responded successfully`,
      userMessage: message,
      agentResponse: `Agent API is reachable. Found ${Array.isArray(data) ? data.length : 'unknown'} agents.`,
      rawResponse: data,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[DEMO] Agent API call failed:", error);
    return NextResponse.json(
      {
        error: "Failed to call agent API",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
