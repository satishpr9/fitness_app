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
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutPlanDto } from './dto/workout.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PlanStatus, UserRole } from '@prisma/client';

@Controller('workouts/plans')
@UseGuards(TenantGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  /**
   * Create workout plan
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.TRAINER, UserRole.CUSTOMER)
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkoutPlanDto,
  ) {
    return this.workoutsService.create(tenantId, user.userId, dto);
  }

  /**
   * List workout plans
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
    return this.workoutsService.findAll(
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
   * Get single workout plan with full exercise breakdown
   */
  @Get(':id')
  findOne(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.workoutsService.findOne(tenantId, id);
  }

  /**
   * Update plan status (Approval workflow)
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.TRAINER, UserRole.SUPER_ADMIN)
  updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: PlanStatus,
  ) {
    return this.workoutsService.updateStatus(tenantId, id, status);
  }
}
