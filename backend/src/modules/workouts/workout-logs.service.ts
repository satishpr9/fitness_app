import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateWorkoutLogDto } from './dto/workout.dto';

@Injectable()
export class WorkoutLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log completed workout performance
   */
  async logWorkout(tenantId: string, userId: string, dto: CreateWorkoutLogDto) {
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.workoutLog.create({
        data: {
          tenantId,
          userId,
          workoutDayId: dto.workoutDayId,
          workoutPlanId: dto.workoutPlanId,
          name: dto.name,
          date: new Date(dto.date),
          startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
          completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
          durationMinutes: dto.durationMinutes,
          caloriesBurned: dto.caloriesBurned,
          perceivedExertionRpe: dto.perceivedExertionRpe,
          notes: dto.notes,
        },
      });

      if (dto.exercises && dto.exercises.length > 0) {
        for (const ex of dto.exercises) {
          await tx.workoutLogExercise.create({
            data: {
              workoutLogId: log.id,
              exerciseId: ex.exerciseId,
              setNumber: ex.setNumber,
              repsCompleted: ex.repsCompleted,
              weightKg: ex.weightKg,
              rpe: ex.rpe,
              notes: ex.notes,
            },
          });
        }
      }

      return tx.workoutLog.findUnique({
        where: { id: log.id },
        include: { exercises: true },
      });
    });
  }

  /**
   * Get workout logs for user
   */
  async getUserLogs(tenantId: string, userId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.workoutLog.findMany({
        where: { tenantId, userId },
        take: limit,
        skip: offset,
        orderBy: { date: 'desc' },
        include: {
          exercises: true,
        },
      }),
      this.prisma.workoutLog.count({ where: { tenantId, userId } }),
    ]);

    return { items, total, limit, offset };
  }

  /**
   * Get single workout log details
   */
  async findOne(tenantId: string, id: string) {
    const log = await this.prisma.workoutLog.findFirst({
      where: { id, tenantId },
      include: {
        exercises: true,
      },
    });

    if (!log) {
      throw new NotFoundException(`Workout log with ID ${id} not found`);
    }

    return log;
  }

  /**
   * Calculate workout streak and consistency stats
   */
  async getWorkoutStats(tenantId: string, userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await this.prisma.workoutLog.findMany({
      where: {
        tenantId,
        userId,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'desc' },
    });

    const totalWorkouts = logs.length;
    const totalMinutes = logs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
    const totalCaloriesBurned = logs.reduce((acc, l) => acc + (l.caloriesBurned || 0), 0);

    return {
      last30DaysCount: totalWorkouts,
      totalMinutes,
      totalCaloriesBurned,
      recentLogs: logs.slice(0, 5),
    };
  }
}
