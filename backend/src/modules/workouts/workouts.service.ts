import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateWorkoutPlanDto } from './dto/workout.dto';
import { PlanStatus, UserRole } from '@prisma/client';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create custom workout plan with nested days and exercise prescriptions
   */
  async create(tenantId: string, createdById: string, dto: CreateWorkoutPlanDto) {
    const customerId = dto.customerId || createdById;

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.workoutPlan.create({
        data: {
          tenantId,
          customerId,
          createdById,
          name: dto.name,
          description: dto.description,
          durationWeeks: dto.durationWeeks || 4,
          difficulty: dto.difficulty || 'BEGINNER',
          goal: dto.goal || 'General Fitness',
          status: dto.status || PlanStatus.DRAFT,
        },
      });

      if (dto.days && dto.days.length > 0) {
        for (const dayDto of dto.days) {
          const day = await tx.workoutDay.create({
            data: {
              workoutPlanId: plan.id,
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

      return this.findOne(tenantId, plan.id);
    });
  }

  /**
   * Find workout plan by ID with nested days and exercises
   */
  async findOne(tenantId: string, id: string) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { id, tenantId },
      include: {
        creator: { select: { id: true, fullName: true, email: true } },
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
  async findAll(
    tenantId: string,
    userRole: string,
    userId: string,
    customerId?: string,
    status?: PlanStatus,
    limit = 20,
    offset = 0,
  ) {
    const where: any = { tenantId };

    if (userRole === UserRole.CUSTOMER) {
      where.customerId = userId;
      where.status = {
        in: [PlanStatus.ASSIGNED, PlanStatus.ACTIVE, PlanStatus.COMPLETED, PlanStatus.DRAFT],
      };
    } else if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.workoutPlan.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, fullName: true } },
          _count: { select: { days: true } },
        },
      }),
      this.prisma.workoutPlan.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  /**
   * Update plan status (Approval / Activation workflow)
   */
  async updateStatus(tenantId: string, planId: string, status: PlanStatus) {
    const plan = await this.findOne(tenantId, planId);

    if (status === PlanStatus.ACTIVE) {
      await this.prisma.workoutPlan.updateMany({
        where: {
          tenantId,
          customerId: plan.customerId,
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
