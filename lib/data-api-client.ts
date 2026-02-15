/**
 * Data API Client Example for Busibox App Template
 *
 * Demonstrates how to use the shared data documents client from @jazzmind/busibox-app
 * for structured data storage via the Busibox data-api service.
 *
 * Pattern:
 * 1. Import generic CRUD (queryRecords, insertRecords, etc.) from busibox-app
 * 2. Define app-specific DOCUMENTS constant and schemas
 * 3. Add graphNode and graphRelationships to schemas for Neo4j knowledge graph sync
 * 4. Use ensureDocuments() to create documents on first use
 * 5. Implement typed operations that call the generic CRUD
 *
 * @see busibox-projects and estimator for full implementations
 */

import {
  generateId,
  getNow,
  cleanRecord,
  queryRecords,
  insertRecords,
  updateRecords,
  deleteRecords,
  ensureDocuments,
} from '@jazzmind/busibox-app';
import type { AppDataSchema } from '@jazzmind/busibox-app';
import type { QueryFilter } from '@jazzmind/busibox-app';
import type { DemoItem } from './types';

// ==========================================================================
// Data Document Names
// ==========================================================================

export const DOCUMENTS = {
  ITEMS: 'demo-items',
} as const;

// ==========================================================================
// Schemas (with graphNode for Neo4j sync)
// ==========================================================================

export const itemSchema: AppDataSchema = {
  fields: {
    id: { type: 'string', required: true, hidden: true },
    name: { type: 'string', required: true, label: 'Name', order: 1 },
    description: { type: 'string', label: 'Description', multiline: true, order: 2 },
    category: { type: 'string', label: 'Category', order: 3 },
    createdAt: { type: 'string', label: 'Created', readonly: true, hidden: true },
    updatedAt: { type: 'string', label: 'Updated', readonly: true, hidden: true },
  },
  displayName: 'Demo Items',
  itemLabel: 'Item',
  sourceApp: 'my-app',
  visibility: 'personal',
  allowSharing: true,
  graphNode: 'DemoItem',
  graphRelationships: [],
};

// ==========================================================================
// Document Setup
// ==========================================================================

const DOCUMENT_CONFIG = {
  items: { name: DOCUMENTS.ITEMS, schema: itemSchema, visibility: 'personal' as const },
};

export interface DocumentIds {
  items: string;
}

/**
 * Ensure data documents exist. Call before any CRUD operations.
 */
export async function ensureDataDocuments(token: string): Promise<DocumentIds> {
  return ensureDocuments(token, DOCUMENT_CONFIG, 'my-app');
}

// ==========================================================================
// Typed Operations
// ==========================================================================

export async function listItems(
  token: string,
  documentId: string,
  options?: { category?: string; limit?: number }
): Promise<{ items: DemoItem[]; total: number }> {
  const where: QueryFilter | undefined = options?.category
    ? { field: 'category', op: 'eq', value: options.category }
    : undefined;

  const result = await queryRecords<DemoItem>(token, documentId, {
    where,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
    limit: options?.limit ?? 50,
  });

  return { items: result.records, total: result.total };
}

export async function createItem(
  token: string,
  documentId: string,
  input: Omit<DemoItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<DemoItem> {
  const now = getNow();
  const record = cleanRecord<DemoItem>({
    id: generateId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  await insertRecords(token, documentId, [record]);
  return record;
}

// Re-export generic CRUD for routes that need them directly
export { queryRecords, insertRecords, updateRecords, deleteRecords } from '@jazzmind/busibox-app';
