import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DietPlansService } from './diet-plans.service';
import {
  CopyDayDto,
  CreateDietPlanDto,
  UpdatePlanStatusDto,
} from './dto/diet-plan.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PlanStatus, UserRole } from '@prisma/client';

@Controller('diets/plans')
@UseGuards(TenantGuard)
export class DietPlansController {
  constructor(private readonly dietPlansService: DietPlansService) {}

  /**
   * Create a new diet plan (manual or template)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.NUTRITIONIST, UserRole.CUSTOMER)
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDietPlanDto,
  ) {
    return this.dietPlansService.create(tenantId, user.userId, dto);
  }

  /**
   * List diet plans
   */
  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('customerId') customerId?: string,
    @Query('status') status?: PlanStatus,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.dietPlansService.findAll(
      tenantId,
      user.role as string,
      user.userId,
      customerId,
      status,
      parseInt(limit, 10),
      parseInt(offset, 10),
    );
  }

  /**
   * Get single diet plan with full day-by-day and meal items breakdown
   */
  @Get(':id')
  findOne(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dietPlansService.findOne(tenantId, id);
  }

  /**
   * Copy meal plan day to another day
   */
  @Post(':id/copy-day')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.NUTRITIONIST, UserRole.CUSTOMER)
  copyDay(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CopyDayDto,
  ) {
    return this.dietPlansService.copyDay(tenantId, id, dto);
  }

  /**
   * Update plan status (Approval workflow)
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.NUTRITIONIST, UserRole.SUPER_ADMIN)
  updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanStatusDto,
  ) {
    return this.dietPlansService.updateStatus(tenantId, id, dto);
  }
}
