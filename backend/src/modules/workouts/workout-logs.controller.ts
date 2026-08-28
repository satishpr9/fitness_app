import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkoutLogsService } from './workout-logs.service';
import { CreateWorkoutLogDto } from './dto/workout.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('workouts/logs')
@UseGuards(TenantGuard)
export class WorkoutLogsController {
  constructor(private readonly workoutLogsService: WorkoutLogsService) {}

  /**
   * Log a completed workout session
   */
  @Post()
  logWorkout(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkoutLogDto,
  ) {
    return this.workoutLogsService.logWorkout(tenantId, user.userId, dto);
  }

  /**
   * Get user's workout log history
   */
  @Get()
  getUserLogs(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.workoutLogsService.getUserLogs(
      tenantId,
      user.userId,
      parseInt(limit, 10),
      parseInt(offset, 10),
    );
  }

  /**
   * Get workout consistency and monthly summary stats
   */
  @Get('stats')
  getStats(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workoutLogsService.getWorkoutStats(tenantId, user.userId);
  }

  /**
   * Get single workout log by ID
   */
  @Get(':id')
  findOne(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.workoutLogsService.findOne(tenantId, id);
  }
}
