#!/bin/bash

# Database migrations runner
# Usage: ./db/run-migrations.sh [DATABASE_URL]

set -e

# Default DATABASE_URL if not provided
if [ -z "$DATABASE_URL" ]; then
    # Use CI/CD environment variables if available
    if [ -n "$POSTGRES_PASSWORD" ] && [ -n "$POSTGRES_DB" ]; then
        DATABASE_URL="postgresql://postgres:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB"
    else
        # Fallback to development defaults
        DATABASE_URL="postgresql://postgres:${POSTGRES_DEV_PASSWORD:-secure_dev_pass}@localhost:5432/facturacion_dev"
    fi
fi

echo "🗄️  Running database migrations..."
echo "📍 Database URL: ${DATABASE_URL}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed or not in PATH"
    exit 1
fi

# Test database connection
echo "🔍 Testing database connection..."
if ! psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to database"
    echo "   Please check your DATABASE_URL and ensure PostgreSQL is running"
    exit 1
fi

echo "✅ Database connection successful"

# Run migrations in order
MIGRATION_DIR="$(dirname "$0")/migrations"

echo "📁 Migration directory: $MIGRATION_DIR"

for migration_file in "$MIGRATION_DIR"/*.sql; do
    if [ -f "$migration_file" ]; then
        echo "🔄 Running migration: $(basename "$migration_file")"
        if psql "$DATABASE_URL" -f "$migration_file"; then
            echo "✅ Migration completed: $(basename "$migration_file")"
        else
            echo "❌ Migration failed: $(basename "$migration_file")"
            exit 1
        fi
    fi
done

echo "🎉 All migrations completed successfully!"
