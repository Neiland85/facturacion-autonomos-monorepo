import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@facturacion/database";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  isActive: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret";
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
  private static readonly JWT_REFRESH_EXPIRES_IN =
    process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate access token
   */
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(): string {
    return jwt.sign({ type: "email_verification" }, this.JWT_SECRET, {
      expiresIn: "24h",
    });
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(): string {
    return jwt.sign({ type: "password_reset" }, this.JWT_SECRET, {
      expiresIn: "1h",
    });
  }

  /**
   * Create a new user
   */
  static async createUser(userData: {
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthUser> {
    const hashedPassword = await this.hashPassword(userData.password);
    const emailVerificationToken = this.generateEmailVerificationToken();

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        emailVerificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isActive: true,
      },
    });

    return user;
  }

  /**
   * Find user by email
   */
  static async findUserByEmail(email: string): Promise<any | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   */
  static async findUserById(id: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isActive: true,
      },
    });

    return user;
  }

  /**
   * Update user refresh token
   */
  static async updateRefreshToken(
    userId: string,
    refreshToken: string | null
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  /**
   * Update user last login
   */
  static async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;

      if (decoded.type !== "email_verification") {
        return false;
      }

      // Find user with this token
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        return false;
      }

      // Update user as verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Initiate password reset
   */
  static async initiatePasswordReset(email: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);

    if (!user) {
      // Don't reveal if user exists or not
      return true;
    }

    const resetToken = this.generatePasswordResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    return true;
  }

  /**
   * Reset password
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;

      if (decoded.type !== "password_reset") {
        return false;
      }

      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        return false;
      }

      const hashedPassword = await this.hashPassword(newPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Prisma client instance
   */
  static getPrisma() {
    return prisma;
  }

  /**
   * Create a new user with transaction
   */
  static async createUserWithTx(tx: any, userData: {
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthUser> {
    const hashedPassword = await this.hashPassword(userData.password);
    const emailVerificationToken = this.generateEmailVerificationToken();

    const user = await tx.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        emailVerificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isActive: true,
      },
    });

    return user;
  }

  /**
   * Update refresh token with transaction
   */
  static async updateRefreshTokenWithTx(tx: any, userId: string, refreshToken: string): Promise<void> {
    await tx.user.update({
      where: { id: userId },
      data: {
        refreshToken,
      },
    });
  }
}
