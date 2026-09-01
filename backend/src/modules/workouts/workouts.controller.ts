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
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutPlanDto } from './dto/workout.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PlanStatus } from '@prisma/client';

@Controller('workouts/plans')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkoutPlanDto,
  ) {
    return this.workoutsService.create(user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: PlanStatus,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.workoutsService.findAll(
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
    return this.workoutsService.findOne(user.userId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('status') status: PlanStatus,
  ) {
    return this.workoutsService.updateStatus(user.userId, id, status);
  }
}
