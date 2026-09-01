import { AuthService } from './auth.service';
import { PrismaService } from '../../core/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SubscriptionTier, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService (B2C)', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwt: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    mockJwt = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };
    service = new AuthService(mockPrisma as PrismaService, mockJwt as JwtService);
  });

  describe('User Registration', () => {
    it('should register a new direct user with hashed password and initialized profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const mockCreatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'athlete@gmail.com',
        fullName: 'John Doe',
        role: UserRole.USER,
        tier: SubscriptionTier.FREE,
        profile: {
          isOnboardingCompleted: false,
        },
      };
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.signUp({
        email: 'athlete@gmail.com',
        password: 'password123',
        fullName: 'John Doe',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'athlete@gmail.com' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.user.email).toBe('athlete@gmail.com');
      expect(result.user.tier).toBe(SubscriptionTier.FREE);
      expect(result.accessToken).toBe('mock-jwt-token');
    });
  });

  describe('User Upgrade Tier', () => {
    it('should upgrade user tier to PREMIUM and return refreshed tokens', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'athlete@gmail.com',
        fullName: 'John Doe',
        role: UserRole.USER,
        tier: SubscriptionTier.PREMIUM,
      });

      const result = await service.upgradeTier(
        '123e4567-e89b-12d3-a456-426614174000',
        SubscriptionTier.PREMIUM,
      );

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: { tier: SubscriptionTier.PREMIUM },
      });
      expect(result.user.tier).toBe(SubscriptionTier.PREMIUM);
      expect(result.accessToken).toBe('mock-jwt-token');
    });
  });
});
