import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/database/prisma.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { SubscriptionTier, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Direct User Registration
   */
  async signUp(dto: SignUpDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Create user and initialize base profile
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        role: UserRole.USER,
        tier: SubscriptionTier.FREE,
        profile: {
          create: {
            fitnessGoal: 'GENERAL_FITNESS',
            activityLevel: 'MODERATELY_ACTIVE',
            dietaryPreference: 'VEGETARIAN',
            onboardingStep: 1,
            isOnboardingCompleted: false,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.fullName,
      user.role,
      user.tier,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tier: user.tier,
        isOnboardingCompleted: user.profile?.isOnboardingCompleted,
      },
      ...tokens,
    };
  }

  /**
   * User Sign In
   */
  async signIn(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated. Please contact support.');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.fullName,
      user.role,
      user.tier,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tier: user.tier,
        isOnboardingCompleted: user.profile?.isOnboardingCompleted,
      },
      ...tokens,
    };
  }

  /**
   * Upgrade user subscription tier (e.g. to PRO)
   */
  async upgradeTier(userId: string, tier: SubscriptionTier) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { tier },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.fullName,
      user.role,
      user.tier,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tier: user.tier,
      },
      ...tokens,
    };
  }

  /**
   * Refresh Token
   */
  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token or user deactivated');
      }

      return this.generateTokens(
        user.id,
        user.email,
        user.fullName,
        user.role,
        user.tier,
      );
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Helper to sign JWT tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
    fullName: string,
    role: UserRole,
    tier: SubscriptionTier,
  ) {
    const payload = {
      sub: userId,
      email,
      app_metadata: {
        role,
        tier,
      },
      user_metadata: {
        full_name: fullName,
      },
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400,
    };
  }
}
