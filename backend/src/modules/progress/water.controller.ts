import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { WaterService } from './water.service';
import { LogWaterDto, QuickAddWaterDto } from './dto/progress.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('water')
@UseGuards(TenantGuard)
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  /**
   * Log water intake amount
   */
  @Post('log')
  logWater(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogWaterDto,
  ) {
    return this.waterService.logWater(tenantId, user.userId, dto);
  }

  /**
   * Quick add water (+250ml, +500ml, etc.)
   */
  @Post('quick-add')
  quickAdd(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: QuickAddWaterDto,
  ) {
    return this.waterService.quickAdd(tenantId, user.userId, dto);
  }

  /**
   * Get daily water stats and goal progress
   */
  @Get('daily')
  getDaily(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.waterService.getDailyWater(tenantId, user.userId, targetDate);
  }

  /**
   * Get weekly water history
   */
  @Get('weekly')
  getWeekly(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate?: string,
  ) {
    const targetDate = startDate || new Date().toISOString().split('T')[0];
    return this.waterService.getWeeklyWater(tenantId, user.userId, targetDate);
  }
}
