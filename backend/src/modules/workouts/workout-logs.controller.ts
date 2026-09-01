import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { WorkoutLogsService } from './workout-logs.service';
import { CreateWorkoutLogDto } from './dto/workout.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('workouts/logs')
export class WorkoutLogsController {
  constructor(private readonly workoutLogsService: WorkoutLogsService) {}

  @Post()
  logWorkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkoutLogDto,
  ) {
    return this.workoutLogsService.logWorkout(user.userId, dto);
  }

  @Get()
  getUserLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.workoutLogsService.getUserLogs(
      user.userId,
      parseInt(limit, 10),
      parseInt(offset, 10),
    );
  }

  @Get('stats')
  getStats(@CurrentUser() user: AuthenticatedUser) {
    return this.workoutLogsService.getWorkoutStats(user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workoutLogsService.findOne(user.userId, id);
  }
}
