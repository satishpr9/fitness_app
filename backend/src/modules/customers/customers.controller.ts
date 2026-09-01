import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('profile')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('me')
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.customersService.getProfile(user.userId);
  }

  @Get(':userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getUserProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.customersService.getProfile(userId);
  }
}
