// Database helper functions for Prisma operations
import { PrismaClient } from "@prisma/client";

// Helper to handle database connection errors
export function handleDatabaseError(error: any): never {
  console.error("Database error:", error);
  throw new Error(`Database operation failed: ${error.message}`);
}

// Helper to safely disconnect from database
export async function disconnectPrisma(prisma: PrismaClient): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
}

// Helper to check if database is connected
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

// Helper to execute database operations with error handling
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string = "Database operation failed"
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`${errorMessage}:`, error);
    throw new Error(`${errorMessage}: ${errorMsg}`);
  }
}

// Helper to create a transaction wrapper
export async function withTransaction<T>(
  prisma: PrismaClient,
  operation: (
    tx: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >
  ) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(
    async (tx: Parameters<typeof operation>[0]) => {
      return await operation(tx);
    }
  );
}

// Helper to safely execute raw queries
export async function executeRawQuery(
  prisma: PrismaClient,
  query: string,
  params: any[] = []
): Promise<any> {
  try {
    return await prisma.$queryRawUnsafe(query, ...params);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Raw query execution failed:", error);
    throw new Error(`Raw query failed: ${errorMsg}`);
  }
}

// Helper to get database connection info
export function getDatabaseInfo(prisma: PrismaClient): string {
  // This is a basic implementation - you might want to extend this
  return "Database connection active";
}

// Export types for convenience
export type { PrismaClient } from "@prisma/client";
