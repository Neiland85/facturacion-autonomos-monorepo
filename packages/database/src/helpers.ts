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
