# ADR-005: Sistema de Autenticación y Autorización

## Estado

**Propuesto** - Julio 2025

## Contexto

Necesitamos un sistema de autenticación robusto que soporte:

- JWT tokens seguros
- Refresh tokens para sesiones largas
- Roles y permisos granulares
- Integración con frontend y APIs
- Cumplimiento con RGPD

## Decisión

Implementamos autenticación basada en **JWT + Refresh Tokens** con **bcrypt** para hashing de passwords y **middleware de autorización** por roles.

## Arquitectura de Autenticación

### Flujo de Autenticación

\`\`\`mermaid
sequenceDiagram
participant C as Client
participant A as Auth API
participant D as Database
participant R as Redis

    C->>A: POST /auth/login (email, password)
    A->>D: Verificar credenciales
    A->>A: Generar JWT + Refresh Token
    A->>R: Guardar refresh token
    A->>C: Respuesta con tokens

    C->>A: Request con JWT
    A->>A: Validar JWT
    A->>C: Respuesta autorizada

    C->>A: POST /auth/refresh (refresh token)
    A->>R: Verificar refresh token
    A->>A: Generar nuevo JWT
    A->>C: Nuevo JWT

\`\`\`

### Configuración JWT

\`\`\`typescript
// packages/core/src/auth/jwt.ts
import jwt from 'jsonwebtoken'
import { User } from '@prisma/client'

export interface JWTPayload {
userId: string
email: string
role: UserRole
iat: number
exp: number
}

export interface RefreshTokenPayload {
userId: string
tokenId: string
iat: number
exp: number
}

export const JWT_CONFIG = {
accessToken: {
secret: process.env.JWT_SECRET!,
expiresIn: '15m'
},
refreshToken: {
secret: process.env.JWT_REFRESH_SECRET!,
expiresIn: '7d'
}
}

export function generateTokens(user: User) {
const tokenId = crypto.randomUUID()

const accessToken = jwt.sign(
{
userId: user.id,
email: user.email,
role: user.role
},
JWT_CONFIG.accessToken.secret,
{ expiresIn: JWT_CONFIG.accessToken.expiresIn }
)

const refreshToken = jwt.sign(
{
userId: user.id,
tokenId
},
JWT_CONFIG.refreshToken.secret,
{ expiresIn: JWT_CONFIG.refreshToken.expiresIn }
)

return { accessToken, refreshToken, tokenId }
}
\`\`\`

### Middleware de Autenticación

\`\`\`typescript
// packages/core/src/auth/middleware.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWTPayload } from './jwt'

declare global {
namespace Express {
interface Request {
user?: JWTPayload
}
}
}

export function authenticateToken(
req: Request,
res: Response,
next: NextFunction
) {
const authHeader = req.headers['authorization']
const token = authHeader && authHeader.split(' ')[1]

if (!token) {
return res.status(401).json({ error: 'Token de acceso requerido' })
}

jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
if (err) {
return res.status(403).json({ error: 'Token inválido' })
}

    req.user = decoded as JWTPayload
    next()

})
}

export function requireRole(roles: UserRole[]) {
return (req: Request, res: Response, next: NextFunction) => {
if (!req.user) {
return res.status(401).json({ error: 'No autenticado' })
}

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permisos insuficientes' })
    }

    next()

}
}
\`\`\`

### Servicio de Autenticación

\`\`\`typescript
// packages/core/src/auth/auth.service.ts
import bcrypt from 'bcryptjs'
import { prisma } from '../db'
import { generateTokens } from './jwt'
import { redis } from '../cache'

export class AuthService {
async register(data: {
email: string
password: string
name: string
}) {
// Verificar si el usuario ya existe
const existingUser = await prisma.user.findUnique({
where: { email: data.email }
})

    if (existingUser) {
      throw new Error('El usuario ya existe')
    }

    // Hash de la contraseña
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(data.password, saltRounds)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'USER'
      }
    })

    // Generar tokens
    const { accessToken, refreshToken, tokenId } = generateTokens(user)

    // Guardar refresh token en Redis
    await redis.setex(\`refresh_token:\${tokenId}\`, 7 * 24 * 60 * 60, user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken,
      refreshToken
    }

}

async login(email: string, password: string) {
// Buscar usuario
const user = await prisma.user.findUnique({
where: { email }
})

    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      throw new Error('Credenciales inválidas')
    }

    // Generar tokens
    const { accessToken, refreshToken, tokenId } = generateTokens(user)

    // Guardar refresh token
    await redis.setex(\`refresh_token:\${tokenId}\`, 7 * 24 * 60 * 60, user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken,
      refreshToken
    }

}

async refreshToken(refreshToken: string) {
try {
const decoded = jwt.verify(
refreshToken,
process.env.JWT_REFRESH_SECRET!
) as RefreshTokenPayload

      // Verificar que el token existe en Redis
      const storedUserId = await redis.get(\`refresh_token:\${decoded.tokenId}\`)

      if (!storedUserId || storedUserId !== decoded.userId) {
        throw new Error('Refresh token inválido')
      }

      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      // Generar nuevo access token
      const { accessToken } = generateTokens(user)

      return { accessToken }

    } catch (error) {
      throw new Error('Refresh token inválido')
    }

}

async logout(refreshToken: string) {
try {
const decoded = jwt.verify(
refreshToken,
process.env.JWT_REFRESH_SECRET!
) as RefreshTokenPayload

      // Eliminar refresh token de Redis
      await redis.del(\`refresh_token:\${decoded.tokenId}\`)

    } catch (error) {
      // Token inválido, no hacer nada
    }

}
}
\`\`\`

### Hook de Autenticación Frontend

\`\`\`typescript
// frontend/src/hooks/use-auth.ts
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
id: string
email: string
name: string
role: string
}

interface AuthContextType {
user: User | null
login: (email: string, password: string) => Promise<void>
logout: () => void
loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
const [user, setUser] = useState<User | null>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
// Verificar token al cargar
const token = localStorage.getItem('accessToken')
if (token) {
// Verificar token con API
fetchUser(token)
} else {
setLoading(false)
}
}, [])

const login = async (email: string, password: string) => {
const response = await fetch('/api/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email, password })
})

    if (!response.ok) {
      throw new Error('Error al iniciar sesión')
    }

    const data = await response.json()

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)

    setUser(data.user)

}

const logout = () => {
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')
setUser(null)
}

return (
<AuthContext.Provider value={{ user, login, logout, loading }}>
{children}
</AuthContext.Provider>
)
}

export function useAuth() {
const context = useContext(AuthContext)
if (context === undefined) {
throw new Error('useAuth must be used within an AuthProvider')
}
return context
}
\`\`\`

## Configuración de Seguridad

### Variables de Entorno

\`\`\`bash

# Secrets (generar con crypto.randomBytes(64).toString('hex'))

JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Configuración bcrypt

BCRYPT_SALT_ROUNDS=12

# Rate limiting

RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
\`\`\`

### Middleware de Rate Limiting

\`\`\`typescript
// packages/core/src/auth/rate-limit.ts
import rateLimit from 'express-rate-limit'

export const authRateLimit = rateLimit({
windowMs: 15 _ 60 _ 1000, // 15 minutos
max: 5, // 5 intentos por IP
message: {
error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
},
standardHeaders: true,
legacyHeaders: false
})
\`\`\`

## Implementación por Fases

### Fase 1: Backend Auth (Semana 1)

- [ ] Configurar JWT y bcrypt
- [ ] Implementar AuthService
- [ ] Crear middleware de autenticación
- [ ] Endpoints de login/register/refresh

### Fase 2: Frontend Integration (Semana 2)

- [ ] AuthProvider y useAuth hook
- [ ] Componentes de login/register
- [ ] Protected routes
- [ ] Auto-refresh de tokens

### Fase 3: Seguridad Avanzada (Semana 3)

- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Logging de seguridad
- [ ] Testing de seguridad

## Consecuencias

### Positivas ✅

- **Seguridad**: JWT stateless + refresh tokens
- **Escalabilidad**: No requiere sesiones en servidor
- **Performance**: Verificación local de tokens
- **Experiencia**: Login automático con refresh

### Negativas ❌

- **Complejidad**: Manejo de refresh tokens
- **Storage**: Dependencia de Redis
- **Revocación**: Complicado revocar tokens JWT

## Configuraciones VS Code

\`\`\`json
{
"rest-client.defaultHeaders": {
"Authorization": "Bearer \${JWT_TOKEN}"
}
}
\`\`\`
