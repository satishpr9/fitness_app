import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  CreateTenantDto,
  UpdateTenantDto,
  UpdateTenantSettingsDto,
} from './dto/tenant.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new organization tenant (SUPER_ADMIN or new Organization Creator)
   */
  async create(dto: CreateTenantDto, creatorUserId?: string) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`Tenant with slug '${dto.slug}' already exists`);
    }

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          slug: dto.slug.toLowerCase(),
          type: dto.type || 'GYM',
          logoUrl: dto.logoUrl,
          address: dto.address,
          phone: dto.phone,
          email: dto.email,
          settings: {
            create: {
              primaryColor: dto.primaryColor || '#10B981',
              waterDefaultTargetMl: dto.waterDefaultTargetMl || 2500,
              allowedAiPlansPerMonth: 100,
            },
          },
          subscriptions: {
            create: {
              planTier: 'FREE',
              status: 'ACTIVE',
              maxCustomers: 10,
              maxTrainers: 2,
              maxNutritionists: 1,
            },
          },
        },
        include: {
          settings: true,
          subscriptions: true,
        },
      });

      // If creator user is provided, associate them as TENANT_ADMIN
      if (creatorUserId) {
        await tx.tenantUser.create({
          data: {
            tenantId: tenant.id,
            userId: creatorUserId,
            role: UserRole.TENANT_ADMIN,
            status: 'ACTIVE',
          },
        });
      }

      return tenant;
    });
  }

  /**
   * Get all tenants (Platform level / Super Admin)
   */
  async findAll(limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          settings: true,
          _count: {
            select: {
              tenantUsers: true,
              customerProfiles: true,
            },
          },
        },
      }),
      this.prisma.tenant.count(),
    ]);

    return { items, total, limit, offset };
  }

  /**
   * Find tenant by ID
   */
  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        settings: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug '${slug}' not found`);
    }

    return tenant;
  }

  /**
   * Update tenant
   */
  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: dto,
      include: { settings: true },
    });
  }

  /**
   * Update tenant settings
   */
  async updateSettings(tenantId: string, dto: UpdateTenantSettingsDto) {
    return this.prisma.tenantSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...dto,
      },
      update: dto,
    });
  }

  /**
   * Get tenant members (Trainers, Nutritionists, Customers)
   */
  async getMembers(tenantId: string, role?: UserRole) {
    return this.prisma.tenantUser.findMany({
      where: {
        tenantId,
        ...(role ? { role } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        customerProfile: true,
        trainerProfile: true,
        nutritionistProfile: true,
      },
    });
  }
}
