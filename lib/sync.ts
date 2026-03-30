/**
 * ============================================
 * DEMO FILE - DELETE WHEN BUILDING REAL APP
 * ============================================
 *
 * Agent sync logic for the busibox-template.
 * Delegates to the shared sync helpers from @jazzmind/busibox-app.
 *
 * When building your real app, copy this file and update
 * the import to point to your agent definitions.
 */

import {
  syncAgentDefinitions,
  getAgentSyncStatus,
} from "@jazzmind/busibox-app/lib/agent/sync";
import type {
  AgentSyncResult,
  SyncStatus,
} from "@jazzmind/busibox-app/lib/agent";
import { AGENT_DEFINITIONS } from "./demo-agents";

export type { AgentSyncResult, SyncStatus };

export async function syncAgents(agentApiToken: string): Promise<AgentSyncResult> {
  return syncAgentDefinitions(agentApiToken, AGENT_DEFINITIONS);
}

export async function getSyncStatus(agentToken: string): Promise<SyncStatus> {
  return getAgentSyncStatus(agentToken, AGENT_DEFINITIONS);
}
