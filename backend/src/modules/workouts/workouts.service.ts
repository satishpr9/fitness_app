import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateWorkoutPlanDto } from './dto/workout.dto';
import { Difficulty, PlanStatus } from '@prisma/client';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create default starter plan for new users
   */
  async createDefaultStarterPlan(userId: string) {
    const exercises = await this.prisma.exercise.findMany({
      where: { isGlobal: true },
    });

    const exMap = new Map<string, string>();
    exercises.forEach((e) => exMap.set(e.name, e.id));

    const plan = await this.prisma.workoutPlan.create({
      data: {
        userId,
        name: '4-Day Strength & Hypertrophy Split',
        description: 'Balanced upper and lower body split designed for sustainable muscle growth and core stability.',
        durationWeeks: 6,
        difficulty: Difficulty.INTERMEDIATE,
        goal: 'Muscle Hypertrophy',
        status: PlanStatus.ACTIVE,
        days: {
          create: [
            {
              dayNumber: 1,
              dayName: 'Chest & Triceps Power',
              isRestDay: false,
              targetDurationMinutes: 50,
              exercises: {
                create: [
                  exMap.get('Barbell Bench Press')
                    ? { exerciseId: exMap.get('Barbell Bench Press')!, orderInDay: 1, sets: 4, reps: 8, targetWeightKg: 60, restTimeSeconds: 90 }
                    : null,
                  exMap.get('Incline Dumbbell Press')
                    ? { exerciseId: exMap.get('Incline Dumbbell Press')!, orderInDay: 2, sets: 3, reps: 10, targetWeightKg: 20, restTimeSeconds: 60 }
                    : null,
                  exMap.get('Triceps Rope Pushdown')
                    ? { exerciseId: exMap.get('Triceps Rope Pushdown')!, orderInDay: 3, sets: 3, reps: 12, targetWeightKg: 15, restTimeSeconds: 60 }
                    : null,
                ].filter(Boolean) as any[],
              },
            },
            {
              dayNumber: 2,
              dayName: 'Back & Biceps Thickness',
              isRestDay: false,
              targetDurationMinutes: 50,
              exercises: {
                create: [
                  exMap.get('Barbell Deadlift')
                    ? { exerciseId: exMap.get('Barbell Deadlift')!, orderInDay: 1, sets: 4, reps: 6, targetWeightKg: 80, restTimeSeconds: 120 }
                    : null,
                  exMap.get('Lat Pulldown')
                    ? { exerciseId: exMap.get('Lat Pulldown')!, orderInDay: 2, sets: 3, reps: 10, targetWeightKg: 45, restTimeSeconds: 60 }
                    : null,
                  exMap.get('Barbell Biceps Curl')
                    ? { exerciseId: exMap.get('Barbell Biceps Curl')!, orderInDay: 3, sets: 3, reps: 12, targetWeightKg: 20, restTimeSeconds: 60 }
                    : null,
                ].filter(Boolean) as any[],
              },
            },
            {
              dayNumber: 3,
              dayName: 'Active Recovery & Core',
              isRestDay: true,
              targetDurationMinutes: 30,
              exercises: {
                create: [
                  exMap.get('Plank Hold')
                    ? { exerciseId: exMap.get('Plank Hold')!, orderInDay: 1, sets: 3, reps: 1, durationSeconds: 60, restTimeSeconds: 45 }
                    : null,
                ].filter(Boolean) as any[],
              },
            },
            {
              dayNumber: 4,
              dayName: 'Legs & Shoulders Hypertrophy',
              isRestDay: false,
              targetDurationMinutes: 55,
              exercises: {
                create: [
                  exMap.get('Barbell Back Squat')
                    ? { exerciseId: exMap.get('Barbell Back Squat')!, orderInDay: 1, sets: 4, reps: 8, targetWeightKg: 70, restTimeSeconds: 90 }
                    : null,
                  exMap.get('Leg Press')
                    ? { exerciseId: exMap.get('Leg Press')!, orderInDay: 2, sets: 3, reps: 10, targetWeightKg: 100, restTimeSeconds: 75 }
                    : null,
                  exMap.get('Overhead Shoulder Press')
                    ? { exerciseId: exMap.get('Overhead Shoulder Press')!, orderInDay: 3, sets: 3, reps: 10, targetWeightKg: 35, restTimeSeconds: 60 }
                    : null,
                  exMap.get('Lateral Raises')
                    ? { exerciseId: exMap.get('Lateral Raises')!, orderInDay: 4, sets: 3, reps: 15, targetWeightKg: 8, restTimeSeconds: 45 }
                    : null,
                ].filter(Boolean) as any[],
              },
            },
          ],
        },
      },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            exercises: {
              orderBy: { orderInDay: 'asc' },
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    return plan;
  }

  /**
   * Create custom workout plan
   */
  async create(userId: string, dto: CreateWorkoutPlanDto) {
    const plan = await this.prisma.$transaction(async (tx) => {
      if (dto.status === PlanStatus.ACTIVE) {
        await tx.workoutPlan.updateMany({
          where: { userId, status: PlanStatus.ACTIVE },
          data: { status: PlanStatus.COMPLETED },
        });
      }

      const created = await tx.workoutPlan.create({
        data: {
          userId,
          name: dto.name,
          description: dto.description,
          durationWeeks: dto.durationWeeks || 4,
          difficulty: dto.difficulty || Difficulty.BEGINNER,
          goal: dto.goal || 'General Fitness',
          status: dto.status || PlanStatus.DRAFT,
        },
      });

      if (dto.days && dto.days.length > 0) {
        for (const dayDto of dto.days) {
          const day = await tx.workoutDay.create({
            data: {
              workoutPlanId: created.id,
              dayNumber: dayDto.dayNumber,
              dayName: dayDto.dayName,
              isRestDay: dayDto.isRestDay || false,
              targetDurationMinutes: dayDto.targetDurationMinutes || 45,
              notes: dayDto.notes,
            },
          });

          if (dayDto.exercises && dayDto.exercises.length > 0) {
            for (let i = 0; i < dayDto.exercises.length; i++) {
              const exDto = dayDto.exercises[i];
              await tx.workoutDayExercise.create({
                data: {
                  workoutDayId: day.id,
                  exerciseId: exDto.exerciseId,
                  orderInDay: exDto.orderInDay || i + 1,
                  sets: exDto.sets || 3,
                  reps: exDto.reps || 10,
                  targetWeightKg: exDto.targetWeightKg,
                  durationSeconds: exDto.durationSeconds,
                  restTimeSeconds: exDto.restTimeSeconds || 60,
                  tempo: exDto.tempo || '2-0-2-0',
                  notes: exDto.notes,
                },
              });
            }
          }
        }
      }

      return created;
    });

    return this.findOne(userId, plan.id);
  }

  /**
   * Find workout plan by ID
   */
  async findOne(userId: string, id: string) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { id, userId },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            exercises: {
              orderBy: { orderInDay: 'asc' },
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Workout plan with ID ${id} not found`);
    }

    return plan;
  }

  /**
   * List workout plans
   */
  async findAll(userId: string, status?: PlanStatus, limit = 20, offset = 0) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    let [items, total] = await Promise.all([
      this.prisma.workoutPlan.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          days: {
            orderBy: { dayNumber: 'asc' },
            include: {
              exercises: {
                orderBy: { orderInDay: 'asc' },
                include: {
                  exercise: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.workoutPlan.count({ where }),
    ]);

    // If user has no plans yet, auto-provision an active starter plan
    if (total === 0 && !status) {
      const defaultPlan = await this.createDefaultStarterPlan(userId);
      items = [defaultPlan as any];
      total = 1;
    }

    return { items, total, limit, offset };
  }

  /**
   * Update plan status (e.g. Set as ACTIVE)
   */
  async updateStatus(userId: string, planId: string, status: PlanStatus) {
    await this.findOne(userId, planId);

    if (status === PlanStatus.ACTIVE) {
      await this.prisma.workoutPlan.updateMany({
        where: {
          userId,
          status: PlanStatus.ACTIVE,
          id: { not: planId },
        },
        data: { status: PlanStatus.COMPLETED },
      });
    }

    return this.prisma.workoutPlan.update({
      where: { id: planId },
      data: { status },
    });
  }
}
