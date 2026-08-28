import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import {
  CreateTenantDto,
  UpdateTenantDto,
  UpdateTenantSettingsDto,
} from './dto/tenant.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '@prisma/client';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * Super Admin: list all tenants
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findAll(
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.tenantsService.findAll(parseInt(limit, 10), parseInt(offset, 10));
  }

  /**
   * Create a new organization tenant
   */
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTenantDto,
  ) {
    return this.tenantsService.create(dto, user?.userId);
  }

  /**
   * Public info by slug (for branding/login pages)
   */
  @Public()
  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  /**
   * Get current tenant details
   */
  @Get('current')
  @UseGuards(TenantGuard)
  getCurrent(@CurrentTenant() tenantId: string) {
    return this.tenantsService.findOne(tenantId);
  }

  /**
   * Update tenant settings
   */
  @Put('settings')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN)
  updateSettings(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateTenantSettingsDto,
  ) {
    return this.tenantsService.updateSettings(tenantId, dto);
  }

  /**
   * Get tenant members by role (Trainers, Nutritionists, Customers)
   */
  @Get('members')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.TRAINER, UserRole.NUTRITIONIST, UserRole.SUPER_ADMIN)
  getMembers(
    @CurrentTenant() tenantId: string,
    @Query('role') role?: UserRole,
  ) {
    return this.tenantsService.getMembers(tenantId, role);
  }

  /**
   * Get tenant by ID (Super Admin)
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.findOne(id);
  }

  /**
   * Update tenant details
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, dto);
  }
}
