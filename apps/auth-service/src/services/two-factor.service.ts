import qrcode from 'qrcode';
import speakeasy from 'speakeasy';
import { redis } from '../index';

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface TwoFactorSecret {
  ascii: string;
  hex: string;
  base32: string;
  otpauth_url?: string;
}

export class TwoFactorService {
  private readonly serviceName = 'Facturación Autónomos';
  private readonly issuer = 'facturacion-autonomos.com';

  /**
   * Generar secreto 2FA y código QR para el usuario
   */
  async generateTwoFactorSecret(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    try {
      // Generar secreto único
      const secret = speakeasy.generateSecret({
        name: `${this.serviceName} (${userEmail})`,
        issuer: this.issuer,
        length: 32
      }) as TwoFactorSecret;

      // Generar códigos de backup
      const backupCodes = this.generateBackupCodes();

      // Almacenar temporalmente en Redis (pendiente de verificación)
      const tempData = {
        secret: secret.base32,
        backupCodes,
        verified: false,
        createdAt: new Date().toISOString()
      };

      // TTL de 10 minutos para setup temporal
      await redis.setex(`2fa_setup:${userId}`, 600, JSON.stringify(tempData));

      // Generar código QR
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

      return {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes
      };
    } catch (error) {
      console.error('Error generando secreto 2FA:', error);
      throw new Error('Error al generar configuración 2FA');
    }
  }

  /**
   * Verificar código 2FA y confirmar setup
   */
  async verifyAndEnableCode(userId: string, token: string): Promise<boolean> {
    try {
      // Obtener setup temporal
      const setupData = await redis.get(`2fa_setup:${userId}`);
      if (!setupData) {
        throw new Error('Setup 2FA no encontrado o expirado');
      }

      const { secret, backupCodes } = JSON.parse(setupData);

      // Verificar el código TOTP
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2 // Permitir +/- 2 intervalos de tiempo (60 segundos)
      });

      if (!verified) {
        return false;
      }

      // Si es válido, guardar permanentemente
      const permanentData = {
        secret,
        backupCodes: backupCodes.map((code: string) => ({ code, used: false })),
        enabled: true,
        createdAt: new Date().toISOString(),
        lastUsed: null
      };

      await redis.setex(`2fa:${userId}`, 86400 * 30, JSON.stringify(permanentData)); // 30 días

      // Limpiar setup temporal
      await redis.del(`2fa_setup:${userId}`);

      return true;
    } catch (error) {
      console.error('Error verificando código 2FA:', error);
      return false;
    }
  }

  /**
   * Verificar código 2FA durante login
   */
  async verifyCode(userId: string, token: string): Promise<boolean> {
    try {
      const userData = await redis.get(`2fa:${userId}`);
      if (!userData) {
        return false;
      }

      const { secret, backupCodes, enabled } = JSON.parse(userData);

      if (!enabled) {
        return false;
      }

      // Verificar si es un código backup
      if (this.isBackupCode(token)) {
        return await this.verifyBackupCode(userId, token, backupCodes);
      }

      // Verificar código TOTP
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (verified) {
        // Actualizar último uso
        const updatedData = JSON.parse(userData);
        updatedData.lastUsed = new Date().toISOString();
        await redis.setex(`2fa:${userId}`, 86400 * 30, JSON.stringify(updatedData));
      }

      return verified;
    } catch (error) {
      console.error('Error verificando código 2FA:', error);
      return false;
    }
  }

  /**
   * Verificar código de backup
   */
  private async verifyBackupCode(userId: string, code: string, backupCodes: any[]): Promise<boolean> {
    try {
      const backupCode = backupCodes.find(bc => bc.code === code && !bc.used);
      
      if (!backupCode) {
        return false;
      }

      // Marcar código como usado
      backupCode.used = true;
      backupCode.usedAt = new Date().toISOString();

      // Actualizar en Redis
      const userData = await redis.get(`2fa:${userId}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        parsedData.backupCodes = backupCodes;
        parsedData.lastUsed = new Date().toISOString();
        await redis.setex(`2fa:${userId}`, 86400 * 30, JSON.stringify(parsedData));
      }

      return true;
    } catch (error) {
      console.error('Error verificando código backup:', error);
      return false;
    }
  }

  /**
   * Deshabilitar 2FA para un usuario
   */
  async disable2FA(userId: string): Promise<boolean> {
    try {
      await redis.del(`2fa:${userId}`);
      await redis.del(`2fa_setup:${userId}`);
      return true;
    } catch (error) {
      console.error('Error deshabilitando 2FA:', error);
      return false;
    }
  }

  /**
   * Generar nuevos códigos de backup
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      const userData = await redis.get(`2fa:${userId}`);
      if (!userData) {
        throw new Error('2FA no configurado para este usuario');
      }

      const parsedData = JSON.parse(userData);
      const newBackupCodes = this.generateBackupCodes();

      parsedData.backupCodes = newBackupCodes.map(code => ({ code, used: false }));
      parsedData.backupCodesRegeneratedAt = new Date().toISOString();

      await redis.setex(`2fa:${userId}`, 86400 * 30, JSON.stringify(parsedData));

      return newBackupCodes;
    } catch (error) {
      console.error('Error regenerando códigos backup:', error);
      throw new Error('Error al regenerar códigos de backup');
    }
  }

  /**
   * Obtener estado 2FA del usuario
   */
  async get2FAStatus(userId: string): Promise<{
    enabled: boolean;
    backupCodesRemaining?: number;
    lastUsed?: string;
  }> {
    try {
      const userData = await redis.get(`2fa:${userId}`);
      if (!userData) {
        return { enabled: false };
      }

      const { enabled, backupCodes, lastUsed } = JSON.parse(userData);
      const unusedBackupCodes = backupCodes?.filter((bc: any) => !bc.used).length || 0;

      return {
        enabled,
        backupCodesRemaining: unusedBackupCodes,
        lastUsed
      };
    } catch (error) {
      console.error('Error obteniendo estado 2FA:', error);
      return { enabled: false };
    }
  }

  /**
   * Generar códigos de backup seguros
   */
  private generateBackupCodes(count = 10): string[] {
    const crypto = require('crypto');
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generar código de 8 dígitos
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }

    return codes;
  }

  /**
   * Verificar si un código es un código de backup (8 caracteres hex)
   */
  private isBackupCode(code: string): boolean {
    return /^[A-F0-9]{8}$/i.test(code);
  }

  /**
   * Limpiar configuraciones 2FA expiradas
   */
  async cleanup2FASetups(): Promise<void> {
    try {
      const keys = await redis.keys('2fa_setup:*');
      const expiredKeys: string[] = [];

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl <= 0) {
          expiredKeys.push(key);
        }
      }

      if (expiredKeys.length > 0) {
        await redis.del(...expiredKeys);
        console.log(`Limpiados ${expiredKeys.length} setups 2FA expirados`);
      }
    } catch (error) {
      console.error('Error limpiando setups 2FA:', error);
    }
  }

  /**
   * Validar formato de código TOTP
   */
  isValidTOTPFormat(token: string): boolean {
    return /^\d{6}$/.test(token);
  }

  /**
   * Obtener tiempo restante para el próximo código TOTP
   */
  getTimeRemaining(): number {
    const now = Math.floor(Date.now() / 1000);
    const timeStep = 30; // TOTP usa intervalos de 30 segundos
    return timeStep - (now % timeStep);
  }
}
