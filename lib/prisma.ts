/**
 * Prisma Client for Busibox App Template
 *
 * This file is OPTIONAL - only needed if APP_MODE=prisma
 *
 * Usage:
 * 1. Ensure DATABASE_URL is set in your environment
 * 2. Run: npm run db:push to sync schema
 * 3. Run: npm run db:generate to generate client
 * 4. Import: import { prisma } from '@/lib/prisma'
 */

import { PrismaClient } from "@prisma/client";

// Prevent multiple instances during development hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      organizationMemberships: {
        include: {
          organization: true,
        },
      },
    },
  });
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: true,
    },
  });

  return memberships.map((m) => ({
    ...m.organization,
    role: m.role,
  }));
}

/**
 * Check if user has access to organization
 */
export async function hasOrganizationAccess(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });

  return !!membership;
}

/**
 * Check if user is organization admin
 */
export async function isOrganizationAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });

  return membership?.role === "OWNER" || membership?.role === "ADMIN";
}

// =============================================================================
// Transaction Helper
// =============================================================================

/**
 * Run a transaction with automatic retry on conflict
 */
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn);
    } catch (error) {
      lastError = error as Error;

      // Check if it's a retryable error (deadlock, serialization failure)
      const errorCode = (error as { code?: string }).code;
      if (errorCode !== "40001" && errorCode !== "40P01") {
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 100)
      );
    }
  }

  throw lastError;
}
