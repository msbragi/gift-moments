import { BadRequestException, GoneException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from 'src/modules/users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/services/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    // Check if user exists and has password
    if (!user?.password) return null;

    // Check if user is verified (for email registrations)
    if (!user.isFromGoogle && !user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Validate password using BaseService method
    const isValid = await this.usersService.comparePasswords(password, user.password);
    if (!isValid) return null;

    // Return the user entity (password will be excluded by select: false in entity)
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateAuthResponse(user);
  }

  async loginWithGoogle(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new UnauthorizedException('Email not found in token');
      }

      let user = await this.usersService.findByEmail(payload.email);

      if (user && !user.isFromGoogle) {
        throw new UnauthorizedException('Account exists. Please login with email and password.');
      }

      // Let BaseService handle password hashing
      if (!user) {
        const createdUser = await this.usersService.create({
          email: payload.email,
          password: crypto.randomBytes(16).toString('hex'), // Random password
          isFromGoogle: true,
          isVerified: true,
          fullName: payload?.name,
          avatar: payload?.picture,
        });
        user = createdUser;
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async registerWithEmail(body: RegisterDto, language: string = 'en') {
    // Check for existing user
    const existingUser = await this.usersService.findByEmail(body.email);
    if (existingUser) {
      throw new UnauthorizedException('Account with this email already exists');
    }

    try {
      const verificationToken = this.jwtService.sign(
        {
          email: body.email,
          language: language,
        },
        { expiresIn: '24h' }
      );

      // Let BaseService handle password hashing
      const user = await this.usersService.create({
        email: body.email,
        password: body.password, // BaseService will hash this
        fullName: body.fullName,
        isFromGoogle: false,
        verifyToken: verificationToken
      });

      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        language
      );

      return {
        status: 'success',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          isVerified: false
        },
        message: 'Registration successful. Please check your email to verify your account.'
      };

    } catch (error) {
      throw new UnauthorizedException('Registration failed');
    }
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const { email, language } = decoded;

      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.verifyToken !== token) {
        throw new BadRequestException('Invalid verification token');
      }

      await this.usersService.update(user.id, {
        isVerified: true,
        verifyToken: null
      });

      return {
        status: 'success',
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          isVerified: true
        }
      };

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new GoneException('Verification link expired');
      }
      throw error;
    }
  }

  async forgotPassword(email: string, language?: string) {
    // Check if user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // We don't want to reveal if the email exists or not for security reasons
      return {
        status: 'success',
        message: 'If your email exists in our system, you will receive a password reset link'
      };
    }

    try {
      // Generate reset token
      const resetToken = this.jwtService.sign(
        {
          email: user.email,
          type: 'password_reset',
          language: language || 'en',
        },
        { expiresIn: '1h' } // shorter expiration for security
      );

      // Update user with reset token
      await this.usersService.update(user.id, {
        pwdResetToken: resetToken,
        pwdResetExpires: new Date(Date.now() + 3600000) // 1 hour from now
      });

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        language || 'en'
      );

      return {
        status: 'success',
        message: 'If your email exists in our system, you will receive a password reset link'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      // Still return success response to prevent email enumeration attacks
      return {
        status: 'success',
        message: 'If your email exists in our system, you will receive a password reset link'
      };
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify token validity
      const decoded = this.jwtService.verify(token);
      const { email, type } = decoded;

      // Ensure it's a password reset token
      if (type !== 'password_reset') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify token matches and hasn't expired
      if (user.pwdResetToken !== token) {
        throw new BadRequestException('Invalid reset token');
      }

      if (!user.pwdResetExpires || new Date() > user.pwdResetExpires) {
        throw new GoneException('Reset token expired');
      }

      // Update password
      await this.usersService.update(user.id, {
        password: newPassword, // BaseService will hash this
        pwdResetToken: null,
        pwdResetExpires: null
      });

      return {
        status: 'success',
        message: 'Password reset successfully'
      };

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new GoneException('Reset link expired');
      }
      // Re-throw the error if it's one of our custom exceptions
      if (error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof GoneException) {
        throw error;
      }
      // For any other error, throw a generic bad request
      throw new BadRequestException('Failed to reset password');
    }
  }

  // Add this after your other methods

  /**
   * Refreshes an access token using a valid refresh token
   * @param refreshToken The refresh token to validate
   * @returns A new access token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET')
      });

      // Check if the decoded token has the expected fields
      if (!decoded.email || !decoded.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if the user still exists
      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      // Generate a new access token with complete payload using centralized method
      const payload = this.buildJwtPayload(user);
      const newAccessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      });

      return {
        access_token: newAccessToken
      };
    } catch (error) {
      // If token verification fails or other errors occur
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Build JWT payload with all necessary user fields
   * This ensures consistency across login, refresh, and other JWT operations
   * @param user User entity with complete data
   * @returns JwtPayload with all required fields
   */
  private buildJwtPayload(user: User): JwtPayload {
    return {
      email: user.email,
      sub: user.id,
      role: user.role,
      disabled: user.disabled,
      // Add any new fields here and they'll be automatically included everywhere
    };
  }

  /**
   * Generate a complete authentication response with access and refresh tokens
   * @param user User entity
   * @returns Object containing access_token, refresh_token, and user data
   */
  private generateAuthResponse(user: User) {
    const payload = this.buildJwtPayload(user);

    // Generate access token (short-lived)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    // Generate refresh token (long-lived)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      }
    };
  }
}