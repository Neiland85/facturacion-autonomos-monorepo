-- Inicialización de base de datos para desarrollo
-- Este script se ejecuta automáticamente al iniciar el contenedor de PostgreSQL

-- Crear usuario para Grafana
CREATE USER grafana WITH PASSWORD 'grafana';

-- Crear base de datos para Grafana
CREATE DATABASE grafana OWNER grafana;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar permisos
GRANT ALL PRIVILEGES ON DATABASE facturacion_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE grafana TO grafana;

-- Configurar timezone
SET timezone = 'Europe/Madrid';

-- Configurar logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- Aplicar configuraciones
SELECT pg_reload_conf();

-- Crear índices adicionales para optimización
-- (Se aplicarán cuando se ejecuten las migraciones de Prisma)

-- Mostrar información de inicialización
SELECT 'Database initialized successfully' AS status;
SELECT version() AS postgresql_version;
SELECT current_database() AS current_db;
SELECT current_user AS current_user;
SELECT now() AS initialized_at;
