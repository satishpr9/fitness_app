import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { UserRole } from '@prisma/client';

@Controller('dashboard')
@UseGuards(TenantGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get personalized customer dashboard overview
   */
  @Get('customer')
  getCustomerDashboard(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dashboardService.getCustomerDashboard(tenantId, user.userId);
  }

  /**
   * Get organization-level analytics dashboard for tenant administrators
   */
  @Get('tenant')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN)
  getTenantDashboard(@CurrentTenant() tenantId: string) {
    return this.dashboardService.getTenantDashboard(tenantId);
  }
}
