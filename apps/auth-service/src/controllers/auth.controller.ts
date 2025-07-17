import * as bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
    AuthenticationError,
    ConflictError,
    NotFoundError,
    ValidationError
} from '../middleware/errorHandler';
import { logAuthAttempt, logger, logPasswordReset, logUserRegistration } from '../utils/logger';

// Mock user data - Replace with actual database implementation
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo - Replace with actual database
const users: User[] = [];
const refreshTokens: Set<string> = new Set();

class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response) {
    const { email, password, firstName, lastName, companyName, phone } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      companyName,
      phone,
      role: 'user',
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(newUser);
    refreshTokens.add(refreshToken);

    // Log registration
    logUserRegistration(email, req.ip);

    // Return response (exclude password)
    const userResponse = this.excludePassword(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 24 * 60 * 60 // 24 hours in seconds
        }
      }
    });
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response) {
    const { email, password, rememberMe = false } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      logAuthAttempt(email, false, req.ip);
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logAuthAttempt(email, false, req.ip);
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user, rememberMe);
    refreshTokens.add(refreshToken);

    // Log successful login
    logAuthAttempt(email, true, req.ip);

    // Return response
    const userResponse = this.excludePassword(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60 // 7 days or 24 hours
        }
      }
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokens.has(refreshToken)) {
      throw new AuthenticationError('Invalid refresh token');
    }

    try {
      const jwtSecret = process.env.JWT_REFRESH_SECRET;
      if (!jwtSecret) {
        throw new AuthenticationError('JWT refresh secret not configured');
      }

      const decoded = jwt.verify(refreshToken, jwtSecret) as any;
      const user = users.find(u => u.id === decoded.userId);

      if (!user) {
        refreshTokens.delete(refreshToken);
        throw new AuthenticationError('User not found');
      }

      // Remove old refresh token
      refreshTokens.delete(refreshToken);

      // Generate new tokens
      const tokens = this.generateTokens(user);
      refreshTokens.add(tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 24 * 60 * 60
          }
        }
      });
    } catch (error) {
      refreshTokens.delete(refreshToken);
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    const refreshToken = req.body.refreshToken;

    // Remove refresh token if provided
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    // In a real implementation, you might want to blacklist the access token
    // For now, we'll just respond with success

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  }

  /**
   * Forgot password
   */
  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      throw new NotFoundError('User with this email does not exist');
    }

    // Generate reset token (in real implementation, store this in database with expiration)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      jwtSecret,
      { expiresIn: '1h' }
    );

    // Log password reset request
    logPasswordReset(email, req.ip);

    // In real implementation, send email with reset link
    logger.info('Password reset token generated', {
      email,
      resetToken,
      expiresIn: '1 hour'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email',
      // Only for development - remove in production
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new ValidationError('JWT secret not configured');
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new ValidationError('Invalid token type');
      }

      const user = users.find(u => u.id === decoded.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Update password
      user.password = hashedPassword;
      user.updatedAt = new Date();

      logger.info('Password reset successful', { userId: user.id, email: user.email });

      res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ValidationError('Invalid or expired reset token');
      }
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req: Request, res: Response) {
    const { token } = req.body;

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new ValidationError('JWT secret not configured');
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      
      if (decoded.type !== 'email_verification') {
        throw new ValidationError('Invalid token type');
      }

      const user = users.find(u => u.id === decoded.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Update email verification status
      user.isEmailVerified = true;
      user.updatedAt = new Date();

      logger.info('Email verified successfully', { userId: user.id, email: user.email });

      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ValidationError('Invalid or expired verification token');
      }
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: User, rememberMe: boolean = false) {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets not configured');
    }

    const accessTokenPayload = { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    };

    const refreshTokenPayload = { 
      userId: user.id, 
      type: 'refresh' 
    };

    // Use direct string values that are compatible with JWT
    const accessToken = jwt.sign(
      accessTokenPayload, 
      jwtSecret, 
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload, 
      jwtRefreshSecret, 
      { expiresIn: rememberMe ? '30d' : '7d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Exclude password from user object
   */
  private excludePassword(user: User) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authController = new AuthController();
