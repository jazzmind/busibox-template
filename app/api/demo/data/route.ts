/**
 * ============================================
 * DEMO FILE - DELETE WHEN BUILDING REAL APP
 * ============================================
 *
 * Example API route using the Busibox data-api for structured data storage.
 * Demonstrates the pattern: ensure documents → list/create items.
 *
 * Pattern:
 * 1. requireAuthWithTokenExchange(request, 'data-api') for data-api token
 * 2. ensureDataDocuments(token) to create documents on first use
 * 3. Use typed operations (listItems, createItem) from data-api-client
 *
 * Graph integration: Schemas with graphNode and graphRelationships
 * automatically sync records to Neo4j knowledge graph.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  listItems,
  createItem,
} from "@/lib/data-api-client";

/**
 * GET /api/demo/data
 * List demo items (optionally filtered by category)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const docs = await ensureDataDocuments(auth.apiToken);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    const { items, total } = await listItems(auth.apiToken, docs.items, {
      category,
      limit,
    });

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("[DEMO] Data API list failed:", error);
    return NextResponse.json(
      {
        error: "Failed to list items",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/demo/data
 * Create a new demo item
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { name, description, category } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required and must be a string" },
        { status: 400 }
      );
    }

    const docs = await ensureDataDocuments(auth.apiToken);
    const item = await createItem(auth.apiToken, docs.items, {
      name,
      description: typeof description === "string" ? description : undefined,
      category: typeof category === "string" ? category : undefined,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("[DEMO] Data API create failed:", error);
    return NextResponse.json(
      {
        error: "Failed to create item",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
