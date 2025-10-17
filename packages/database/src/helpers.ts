// Database helper functions for Prisma operations
import type { PrismaClient } from "./generated";

// Helper to handle database connection errors
export function handleDatabaseError(error: any): never {
  console.error("Database error:", error);
  throw new Error(`Database operation failed: ${error.message}`);
}

// Helper to safely disconnect from database
export async function disconnectDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$disconnect();
}

// Helper to check database connection
export async function checkDatabaseConnection(
  prisma: PrismaClient
): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
}

// Helper to create a transaction
export async function withTransaction<T>(
  prisma: PrismaClient,
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await callback(tx as PrismaClient);
  });
}

// Helper to batch operations
export async function batchOperations<T>(
  prisma: PrismaClient,
  operations: Array<Promise<T>>
): Promise<T[]> {
  return await Promise.all(operations);
}

// Helper to handle unique constraint violations
export function isUniqueConstraintError(error: any): boolean {
  return error.code === "P2002";
}

// Helper to handle foreign key constraint violations
export function isForeignKeyConstraintError(error: any): boolean {
  return error.code === "P2003";
}

// Helper to handle record not found errors
export function isRecordNotFoundError(error: any): boolean {
  return error.code === "P2025";
}

// Helper to get error message
export function getDatabaseErrorMessage(error: any): string {
  if (error.code) {
    return `Database error (${error.code}): ${error.message}`;
  }
  return error.message || "Unknown database error";
}

// Helper to validate Prisma client instance
export function validatePrismaClient(prisma: any): prisma is PrismaClient {
  return (
    prisma !== null &&
    typeof prisma === "object" &&
    "$connect" in prisma &&
    "$disconnect" in prisma
  );
}

// ===========================================
// 🔄 IDEMPOTENCY HELPERS
// ===========================================

import { setIdempotencyKey } from "./redis";

// Helper to execute idempotent operations
export async function createIdempotentOperation<T>(
  prisma: PrismaClient,
  key: string,
  requestHash: string,
  operation: () => Promise<{ data: T; statusCode: number }>
): Promise<{ data: T; statusCode: number }> {
  return await withTransaction(prisma, async (tx) => {
    // Check if operation already exists in database
    const existing = await tx.idempotencyKey.findUnique({
      where: { key },
    });

    if (existing) {
      // Validate request hash matches
      if (existing.requestHash !== requestHash) {
        throw new Error("Idempotency key exists with different request");
      }

      // Return cached response
      return {
        data: existing.response as T,
        statusCode: existing.statusCode || 200,
      };
    }

    // Execute the operation
    const result = await operation();

    // Store the result
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await tx.idempotencyKey.create({
      data: {
        key,
        requestHash,
        response: result.data,
        statusCode: result.statusCode,
        expiresAt,
      },
    });

    // Cache in Redis for faster lookups
    await setIdempotencyKey(key, result, 3600); // 1 hour

    return result;
  });
}

// Helper to get idempotent result from database
export async function getIdempotentResult(
  prisma: PrismaClient,
  key: string,
  requestHash: string
): Promise<{ data: any; statusCode: number } | null> {
  const existing = await prisma.idempotencyKey.findUnique({
    where: { key },
  });

  if (!existing) return null;

  // Validate request hash matches
  if (existing.requestHash !== requestHash) {
    throw new Error("Idempotency key exists with different request");
  }

  return {
    data: existing.response,
    statusCode: existing.statusCode || 200,
  };
}

// Helper to clean expired idempotency keys
export async function cleanExpiredIdempotencyKeys(
  prisma: PrismaClient
): Promise<number> {
  const result = await prisma.idempotencyKey.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

// Helper to check if webhook is duplicate
export async function isWebhookDuplicate(
  prisma: PrismaClient,
  webhookId: string
): Promise<boolean> {
  const existing = await prisma.webhookNotificacion.findUnique({
    where: { webhookId },
  });

  return !!existing;
}
