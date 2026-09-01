import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DietPlansService } from './diet-plans.service';
import {
  CopyDayDto,
  CreateDietPlanDto,
  UpdatePlanStatusDto,
} from './dto/diet-plan.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PlanStatus } from '@prisma/client';

@Controller('diets/plans')
export class DietPlansController {
  constructor(private readonly dietPlansService: DietPlansService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDietPlanDto,
  ) {
    return this.dietPlansService.create(user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: PlanStatus,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.dietPlansService.findAll(
      user.userId,
      status,
      parseInt(limit, 10),
      parseInt(offset, 10),
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dietPlansService.findOne(user.userId, id);
  }

  @Post(':id/copy-day')
  copyDay(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CopyDayDto,
  ) {
    return this.dietPlansService.copyDay(user.userId, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePlanStatusDto,
  ) {
    return this.dietPlansService.updateStatus(user.userId, id, dto);
  }
}
