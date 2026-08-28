import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/database/prisma.service';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * User Registration
   */
  async signUp(dto: SignUpDto) {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Resolve tenant if tenantSlug provided
    let tenant = null;
    if (dto.tenantSlug) {
      tenant = await this.prisma.tenant.findUnique({
        where: { slug: dto.tenantSlug },
      });
      if (!tenant) {
        throw new NotFoundException(`Tenant with slug '${dto.tenantSlug}' not found`);
      }
    } else {
      // Find default tenant or create default public gym tenant
      tenant = await this.prisma.tenant.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });

      if (!tenant) {
        // Create initial default organization
        tenant = await this.prisma.tenant.create({
          data: {
            name: 'Apex Fitness Club',
            slug: 'apex-fitness',
            type: 'GYM',
            settings: {
              create: {
                primaryColor: '#10B981',
                waterDefaultTargetMl: 2500,
                allowedAiPlansPerMonth: 100,
              },
            },
          },
        });
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const assignedRole = dto.role || UserRole.CUSTOMER;

    // Create user in database
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        isSuperAdmin: assignedRole === UserRole.SUPER_ADMIN,
        tenantUsers: {
          create: {
            tenantId: tenant.id,
            role: assignedRole,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        tenantUsers: true,
      },
    });

    const tenantUser = user.tenantUsers[0];

    // Initialize role-specific profile
    if (assignedRole === UserRole.CUSTOMER) {
      await this.prisma.customerProfile.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          tenantUserId: tenantUser.id,
          fitnessGoal: 'GENERAL_FITNESS',
          activityLevel: 'MODERATELY_ACTIVE',
          dietaryPreference: 'VEGETARIAN',
        },
      });
    } else if (assignedRole === UserRole.TRAINER) {
      await this.prisma.trainerProfile.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          tenantUserId: tenantUser.id,
        },
      });
    } else if (assignedRole === UserRole.NUTRITIONIST) {
      await this.prisma.nutritionistProfile.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          tenantUserId: tenantUser.id,
        },
      });
    }

    // Generate JWT tokens
    const tokens = await this.generateTokens(user.id, user.email, user.fullName, tenant.id, assignedRole, user.isSuperAdmin);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: assignedRole,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        tenantName: tenant.name,
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
      include: {
        tenantUsers: {
          include: {
            tenant: true,
          },
        },
      },
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

    // Resolve tenant membership
    let tenantMembership = user.tenantUsers[0];
    if (dto.tenantSlug) {
      const match = user.tenantUsers.find((tu) => tu.tenant.slug === dto.tenantSlug);
      if (match) {
        tenantMembership = match;
      }
    }

    const tenantId = tenantMembership?.tenantId;
    const role = tenantMembership?.role || (user.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.CUSTOMER);

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.fullName,
      tenantId,
      role,
      user.isSuperAdmin,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role,
        tenantId,
        tenantSlug: tenantMembership?.tenant?.slug,
        tenantName: tenantMembership?.tenant?.name,
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
        include: {
          tenantUsers: {
            include: { tenant: true },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token or user deactivated');
      }

      const tenantUser = user.tenantUsers[0];
      const role = tenantUser?.role || (user.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.CUSTOMER);

      return this.generateTokens(
        user.id,
        user.email,
        user.fullName,
        tenantUser?.tenantId,
        role,
        user.isSuperAdmin,
      );
    } catch {
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
    tenantId?: string,
    role?: UserRole,
    isSuperAdmin?: boolean,
  ) {
    const payload = {
      sub: userId,
      email,
      app_metadata: {
        tenant_id: tenantId,
        role,
        roles: role ? [role] : [],
        is_super_admin: isSuperAdmin || false,
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
