-- Script de inicialización de la base de datos para microservicios
-- Este script crea las bases de datos y usuarios para cada microservicio

-- Base de datos para Auth Service
CREATE DATABASE auth_db;
CREATE USER auth_user WITH ENCRYPTED PASSWORD 'auth_password';
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;

-- Base de datos para Invoice Service
CREATE DATABASE invoice_db;
CREATE USER invoice_user WITH ENCRYPTED PASSWORD 'invoice_password';
GRANT ALL PRIVILEGES ON DATABASE invoice_db TO invoice_user;

-- Base de datos para Client Service
CREATE DATABASE client_db;
CREATE USER client_user WITH ENCRYPTED PASSWORD 'client_password';
GRANT ALL PRIVILEGES ON DATABASE client_db TO client_user;

-- Base de datos para Tax Service
CREATE DATABASE tax_db;
CREATE USER tax_user WITH ENCRYPTED PASSWORD 'tax_password';
GRANT ALL PRIVILEGES ON DATABASE tax_db TO tax_user;

-- Base de datos para AEAT Service
CREATE DATABASE aeat_db;
CREATE USER aeat_user WITH ENCRYPTED PASSWORD 'aeat_password';
GRANT ALL PRIVILEGES ON DATABASE aeat_db TO aeat_user;

-- Base de datos para PEPPOL Service
CREATE DATABASE peppol_db;
CREATE USER peppol_user WITH ENCRYPTED PASSWORD 'peppol_password';
GRANT ALL PRIVILEGES ON DATABASE peppol_db TO peppol_user;

-- Base de datos para Notification Service
CREATE DATABASE notification_db;
CREATE USER notification_user WITH ENCRYPTED PASSWORD 'notification_password';
GRANT ALL PRIVILEGES ON DATABASE notification_db TO notification_user;

-- Base de datos para Storage Service
CREATE DATABASE storage_db;
CREATE USER storage_user WITH ENCRYPTED PASSWORD 'storage_password';
GRANT ALL PRIVILEGES ON DATABASE storage_db TO storage_user;

-- Configuraciones adicionales
-- Activar extensiones necesarias para cada base de datos

\c auth_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c invoice_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c client_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c tax_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c aeat_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c peppol_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c notification_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c storage_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
