import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const tenantId =
      req.headers['x-tenant-id'] ||
      req.params?.tenantId ||
      user?.tenantId;

    if (!user || !user.userId) {
      throw new ForbiddenException('User must be authenticated');
    }

    // SUPER_ADMIN can access all tenants
    if (user.isSuperAdmin || user.role === UserRole.SUPER_ADMIN) {
      req.tenantId = tenantId || user.tenantId;
      return true;
    }

    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }

    // Verify user is member of this tenant
    const membership = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.userId,
        },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Access denied: You do not belong to this organization or your membership is inactive',
      );
    }

    req.tenantId = tenantId;
    req.tenantUser = membership;

    return true;
  }
}
