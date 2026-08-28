import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CalculateNutritionDto } from './dto/nutrition-calculation.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { UserRole } from '@prisma/client';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  /**
   * Public deterministic calculation endpoint (e.g. for calculators / onboarding preview)
   */
  @Public()
  @Post('calculate')
  calculate(@Body() dto: CalculateNutritionDto) {
    return this.nutritionService.calculateTargets(dto);
  }

  /**
   * Get authenticated user's current nutrition targets
   */
  @Get('targets')
  @UseGuards(TenantGuard)
  getMyTargets(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.nutritionService.getUserTargets(tenantId, user.userId);
  }

  /**
   * Trainer/Nutritionist/Admin: get customer targets
   */
  @Get('targets/customer/:customerId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.TRAINER, UserRole.NUTRITIONIST)
  getCustomerTargets(
    @CurrentTenant() tenantId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.nutritionService.getUserTargets(tenantId, customerId);
  }

  /**
   * Trainer/Nutritionist/Admin: override customer nutrition targets
   */
  @Put('targets/customer/:customerId/override')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.TRAINER, UserRole.NUTRITIONIST)
  overrideCustomerTargets(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body()
    body: {
      dailyCalorieTarget?: number;
      proteinTargetG?: number;
      carbsTargetG?: number;
      fatTargetG?: number;
      fiberTargetG?: number;
      notes?: string;
    },
  ) {
    return this.nutritionService.overrideUserTargets(
      tenantId,
      customerId,
      user.userId,
      body,
    );
  }
}
