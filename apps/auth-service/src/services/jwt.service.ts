import jwt from "jsonwebtoken";
import { redis } from "../index";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry = "15m"; // 15 minutos
  private readonly refreshTokenExpiry = "7d"; // 7 días

  constructor() {
    this.accessTokenSecret =
      process.env.JWT_ACCESS_SECRET ??
      "fallback-access-secret-change-in-production";
    this.refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET ??
      "fallback-refresh-secret-change-in-production";
  }

  /**
   * Generar access token individual (para compatibilidad con controlador)
   */
  async generateAccessToken(payload: JWTPayload): Promise<string> {
    try {
      const accessToken = jwt.sign(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          sessionId: payload.sessionId,
        },
        this.accessTokenSecret,
        {
          expiresIn: this.accessTokenExpiry,
          issuer: "facturacion-autonomos",
          audience: "facturacion-autonomos-app",
        }
      );

      return accessToken;
    } catch (error) {
      console.error("Error generando access token:", error);
      throw new Error("Error al generar access token");
    }
  }

  /**
   * Generar refresh token individual (para compatibilidad con controlador)
   */
  async generateRefreshToken(userId: string): Promise<string> {
    try {
      const refreshTokenId = this.generateSecureTokenId();
      const refreshToken = jwt.sign(
        {
          userId,
          tokenId: refreshTokenId,
          type: "refresh",
        },
        this.refreshTokenSecret,
        {
          expiresIn: this.refreshTokenExpiry,
          issuer: "facturacion-autonomos",
          audience: "facturacion-autonomos-app",
        }
      );

      return refreshToken;
    } catch (error) {
      console.error("Error generando refresh token:", error);
      throw new Error("Error al generar refresh token");
    }
  }

  /**
   * Almacenar refresh token en Redis (para compatibilidad con controlador)
   */
  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as any;

      const refreshTokenData = {
        userId,
        email: decoded.email || "", // Puede no estar disponible en este contexto
        role: decoded.role || "user", // Valor por defecto
        sessionId: decoded.sessionId,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      };

      // TTL de 7 días (604800 segundos)
      await redis.setex(
        `refresh_token:${userId}:${decoded.tokenId}`,
        604800,
        JSON.stringify(refreshTokenData)
      );
    } catch (error) {
      console.error("Error almacenando refresh token:", error);
      throw new Error("Error al almacenar refresh token");
    }
  }

  /**
   * Generar par de tokens (access + refresh) con almacenamiento seguro en Redis
   */
  async generateTokenPair(payload: JWTPayload): Promise<TokenPair> {
    try {
      // Generar access token con corta duración
      const accessToken = jwt.sign(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          sessionId: payload.sessionId,
        },
        this.accessTokenSecret,
        {
          expiresIn: this.accessTokenExpiry,
          issuer: "facturacion-autonomos",
          audience: "facturacion-autonomos-app",
        }
      );

      // Generar refresh token con larga duración
      const refreshTokenId = this.generateSecureTokenId();
      const refreshToken = jwt.sign(
        {
          userId: payload.userId,
          tokenId: refreshTokenId,
          type: "refresh",
        },
        this.refreshTokenSecret,
        {
          expiresIn: this.refreshTokenExpiry,
          issuer: "facturacion-autonomos",
          audience: "facturacion-autonomos-app",
        }
      );

      // Almacenar refresh token en Redis con TTL
      const refreshTokenData = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      };

      // TTL de 7 días (604800 segundos)
      await redis.setex(
        `refresh_token:${payload.userId}:${refreshTokenId}`,
        604800,
        JSON.stringify(refreshTokenData)
      );

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error generando tokens:", error);
      throw new Error("Error al generar tokens de autenticación");
    }
  }

  /**
   * Verificar y decodificar access token
   */
  async verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: "facturacion-autonomos",
        audience: "facturacion-autonomos-app",
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log("Access token expirado");
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.log("Access token inválido");
      }
      return null;
    }
  }

  /**
   * Verificar y decodificar refresh token
   */
  async verifyRefreshToken(token: string): Promise<JWTPayload | null> {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: "facturacion-autonomos",
        audience: "facturacion-autonomos-app",
      }) as any;

      // Verificar que el token existe en Redis
      const tokenData = await redis.get(
        `refresh_token:${decoded.userId}:${decoded.tokenId}`
      );
      if (!tokenData) {
        console.log("Refresh token no encontrado en Redis");
        return null;
      }

      const parsedData = JSON.parse(tokenData);

      // Actualizar último uso
      parsedData.lastUsed = new Date().toISOString();
      await redis.setex(
        `refresh_token:${decoded.userId}:${decoded.tokenId}`,
        604800,
        JSON.stringify(parsedData)
      );

      return {
        userId: parsedData.userId,
        email: parsedData.email,
        role: parsedData.role,
        sessionId: parsedData.sessionId,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log("Refresh token expirado");
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.log("Refresh token inválido");
      }
      return null;
    }
  }

  /**
   * Refrescar access token usando refresh token válido
   */
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      if (!payload) {
        return null;
      }

      // Generar nuevo access token
      const accessToken = jwt.sign(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          sessionId: payload.sessionId,
        },
        this.accessTokenSecret,
        {
          expiresIn: this.accessTokenExpiry,
          issuer: "facturacion-autonomos",
          audience: "facturacion-autonomos-app",
        }
      );

      return accessToken;
    } catch (error) {
      console.error("Error refrescando access token:", error);
      return null;
    }
  }

  /**
   * Revocar refresh token específico
   */
  async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as any;
      await redis.del(`refresh_token:${decoded.userId}:${decoded.tokenId}`);
      return true;
    } catch (error) {
      console.error("Error revocando refresh token:", error);
      return false;
    }
  }

  /**
   * Revocar todos los refresh tokens de un usuario
   */
  async revokeAllRefreshTokens(userId: string): Promise<boolean> {
    try {
      const keys = await redis.keys(`refresh_token:${userId}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error("Error revocando todos los refresh tokens:", error);
      return false;
    }
  }

  /**
   * Limpiar tokens expirados de Redis (housekeeping)
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const keys = await redis.keys("refresh_token:*");
      const expiredKeys: string[] = [];

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl <= 0) {
          expiredKeys.push(key);
        }
      }

      if (expiredKeys.length > 0) {
        await redis.del(...expiredKeys);
        console.log(`Limpiados ${expiredKeys.length} tokens expirados`);
      }
    } catch (error) {
      console.error("Error limpiando tokens expirados:", error);
    }
  }

  /**
   * Obtener información de todos los refresh tokens activos de un usuario
   */
  async getUserActiveSessions(userId: string): Promise<any[]> {
    try {
      const keys = await redis.keys(`refresh_token:${userId}:*`);
      const sessions = [];

      for (const key of keys) {
        const tokenData = await redis.get(key);
        if (tokenData) {
          const parsed = JSON.parse(tokenData);
          const ttl = await redis.ttl(key);
          sessions.push({
            sessionId: parsed.sessionId,
            createdAt: parsed.createdAt,
            lastUsed: parsed.lastUsed,
            expiresIn: ttl,
          });
        }
      }

      return sessions;
    } catch (error) {
      console.error("Error obteniendo sesiones activas:", error);
      return [];
    }
  }

  /**
   * Generar ID único para tokens
   */
  private generateSecureTokenId(): string {
    const crypto = require("crypto");
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Decodificar token sin verificación (para debugging)
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error("Error decodificando token:", error);
      return null;
    }
  }

  /**
   * Verificar si un token está próximo a expirar (útil para renovación automática)
   */
  isTokenExpiringSoon(token: string, thresholdMinutes = 5): boolean {
    try {
      const decoded: any = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      const thresholdSeconds = thresholdMinutes * 60;

      return timeUntilExpiry <= thresholdSeconds;
    } catch (error) {
      return true;
    }
  }
}
