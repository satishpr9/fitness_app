import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { AssignProfessionalDto } from './dto/onboarding.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { UserRole } from '@prisma/client';

@Controller('customers')
@UseGuards(TenantGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Get own customer profile
   */
  @Get('me')
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.customersService.getProfile(user.userId);
  }

  /**
   * List customers in tenant (Admins, Trainers, Nutritionists)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.TRAINER, UserRole.NUTRITIONIST, UserRole.SUPER_ADMIN)
  getTenantCustomers(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.customersService.getTenantCustomers(
      tenantId,
      user.role as string,
      user.userId,
      parseInt(limit, 10),
      parseInt(offset, 10),
    );
  }

  /**
   * Get specific customer profile
   */
  @Get(':customerId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.TRAINER, UserRole.NUTRITIONIST, UserRole.SUPER_ADMIN)
  getCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.customersService.getProfile(customerId);
  }

  /**
   * Assign trainer and/or nutritionist to a customer (TENANT_ADMIN only)
   */
  @Put(':customerId/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN)
  assignProfessionals(
    @CurrentTenant() tenantId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body() dto: AssignProfessionalDto,
  ) {
    return this.customersService.assignProfessionals(
      tenantId,
      customerId,
      dto.trainerId,
      dto.nutritionistId,
    );
  }
}
