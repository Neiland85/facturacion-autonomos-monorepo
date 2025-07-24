import bcrypt from 'bcryptjs';
import { redis } from '../index';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export class AuthService {
  private readonly saltRounds = 12;

  /**
   * Crear nuevo usuario con contraseña hasheada de forma segura
   */
  async createUser(data: CreateUserData): Promise<User> {
    try {
      // Hash de la contraseña con salt rounds altos
      const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

      // Simular creación en DB (en un proyecto real usarías Prisma)
      const user: User = {
        id: this.generateSecureId(),
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'USER',
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Guardar en Redis temporalmente (en producción usarías una base de datos)
      await redis.setex(`user:${user.id}`, 86400, JSON.stringify(user));
      await redis.setex(`user:email:${user.email}`, 86400, user.id);

      return user;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw new Error('Error al crear usuario');
    }
  }

  /**
   * Buscar usuario por email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const userId = await redis.get(`user:email:${email}`);
      if (!userId) {
        return null;
      }

      const userJson = await redis.get(`user:${userId}`);
      if (!userJson) {
        return null;
      }

      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Error buscando usuario por email:', error);
      return null;
    }
  }

  /**
   * Buscar usuario por ID
   */
  async findUserById(id: string): Promise<User | null> {
    try {
      const userJson = await redis.get(`user:${id}`);
      if (!userJson) {
        return null;
      }

      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Error buscando usuario por ID:', error);
      return null;
    }
  }

  /**
   * Habilitar 2FA para un usuario
   */
  async enable2FA(userId: string): Promise<void> {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      user.twoFactorEnabled = true;
      user.updatedAt = new Date();

      await redis.setex(`user:${userId}`, 86400, JSON.stringify(user));
    } catch (error) {
      console.error('Error habilitando 2FA:', error);
      throw new Error('Error al habilitar 2FA');
    }
  }

  /**
   * Deshabilitar 2FA para un usuario
   */
  async disable2FA(userId: string): Promise<void> {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.updatedAt = new Date();

      await redis.setex(`user:${userId}`, 86400, JSON.stringify(user));
      
      // Limpiar secreto 2FA de Redis
      await redis.del(`2fa:${userId}`);
    } catch (error) {
      console.error('Error deshabilitando 2FA:', error);
      throw new Error('Error al deshabilitar 2FA');
    }
  }

  /**
   * Cambiar contraseña del usuario
   */
  async changePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
      
      user.password = hashedPassword;
      user.updatedAt = new Date();

      await redis.setex(`user:${userId}`, 86400, JSON.stringify(user));

      // Invalidar todas las sesiones del usuario por seguridad
      await this.invalidateUserSessions(userId);
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw new Error('Error al cambiar contraseña');
    }
  }

  /**
   * Verificar fortaleza de contraseña
   */
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (!/[!@#$%^&*()_+=\[\]{};':"\\|,.<>?-]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Invalidar todas las sesiones de un usuario
   */
  private async invalidateUserSessions(userId: string): Promise<void> {
    try {
      // Invalidar refresh tokens
      const refreshTokenKeys = await redis.keys(`refresh_token:${userId}:*`);
      if (refreshTokenKeys.length > 0) {
        await redis.del(...refreshTokenKeys);
      }

      // Invalidar sesiones activas
      const sessionKeys = await redis.keys(`facturacion_sess:*`);
      for (const sessionKey of sessionKeys) {
        const sessionData = await redis.get(sessionKey);
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData);
            if (session.userId === userId) {
              await redis.del(sessionKey);
            }
          } catch (error) {
            console.error('Error parsing session data:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error invalidating user sessions:', error);
    }
  }

  /**
   * Generar ID seguro para usuario
   */
  private generateSecureId(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Verificar si el email es válido
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitizar entrada de usuario
   */
  sanitizeInput(input: string): string {
    return input.trim().toLowerCase();
  }
}
