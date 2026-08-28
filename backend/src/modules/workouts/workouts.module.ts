import { Module } from '@nestjs/common';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { WorkoutLogsController } from './workout-logs.controller';
import { WorkoutLogsService } from './workout-logs.service';
import { ExercisesModule } from '../exercises/exercises.module';

@Module({
  imports: [ExercisesModule],
  controllers: [WorkoutsController, WorkoutLogsController],
  providers: [WorkoutsService, WorkoutLogsService],
  exports: [WorkoutsService, WorkoutLogsService],
})
export class WorkoutsModule {}
