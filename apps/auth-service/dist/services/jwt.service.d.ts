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
export declare class JWTService {
    private readonly accessTokenSecret;
    private readonly refreshTokenSecret;
    private readonly accessTokenExpiry;
    private readonly refreshTokenExpiry;
    constructor();
    /**
     * Generar par de tokens (access + refresh) con almacenamiento seguro en Redis
     */
    generateTokenPair(payload: JWTPayload): Promise<TokenPair>;
    /**
     * Verificar y decodificar access token
     */
    verifyAccessToken(token: string): Promise<JWTPayload | null>;
    /**
     * Verificar y decodificar refresh token
     */
    verifyRefreshToken(token: string): Promise<JWTPayload | null>;
    /**
     * Refrescar access token usando refresh token válido
     */
    refreshAccessToken(refreshToken: string): Promise<string | null>;
    /**
     * Revocar refresh token específico
     */
    revokeRefreshToken(refreshToken: string): Promise<boolean>;
    /**
     * Revocar todos los refresh tokens de un usuario
     */
    revokeAllRefreshTokens(userId: string): Promise<boolean>;
    /**
     * Limpiar tokens expirados de Redis (housekeeping)
     */
    cleanupExpiredTokens(): Promise<void>;
    /**
     * Obtener información de todos los refresh tokens activos de un usuario
     */
    getUserActiveSessions(userId: string): Promise<any[]>;
    /**
     * Generar ID único para tokens
     */
    private generateSecureTokenId;
    /**
     * Decodificar token sin verificación (para debugging)
     */
    decodeToken(token: string): any;
    /**
     * Verificar si un token está próximo a expirar (útil para renovación automática)
     */
    isTokenExpiringSoon(token: string, thresholdMinutes?: number): boolean;
}
export {};
//# sourceMappingURL=jwt.service.d.ts.map