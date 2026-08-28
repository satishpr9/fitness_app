import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  CopyDayDto,
  CreateDietMealDto,
  CreateDietMealItemDto,
  CreateDietPlanDto,
  UpdatePlanStatusDto,
} from './dto/diet-plan.dto';
import { PlanStatus, UserRole } from '@prisma/client';

@Injectable()
export class DietPlansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new diet plan with nested days, meals, and food items
   */
  async create(tenantId: string, createdById: string, dto: CreateDietPlanDto) {
    const customerId = dto.customerId || createdById;

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.dietPlan.create({
        data: {
          tenantId,
          customerId,
          createdById,
          name: dto.name,
          description: dto.description,
          durationDays: dto.durationDays || 7,
          targetCalories: dto.targetCalories,
          targetProteinG: dto.targetProteinG,
          targetCarbsG: dto.targetCarbsG,
          targetFatG: dto.targetFatG,
          status: dto.status || PlanStatus.DRAFT,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        },
      });

      // If days provided, create days and meals
      if (dto.days && dto.days.length > 0) {
        for (const dayDto of dto.days) {
          let dayCal = 0,
            dayP = 0,
            dayC = 0,
            dayF = 0,
            dayFib = 0;

          // Precompute day totals from meals
          for (const meal of dayDto.meals) {
            for (const item of meal.items) {
              dayCal += item.calories;
              dayP += item.proteinG;
              dayC += item.carbsG;
              dayF += item.fatG;
              dayFib += item.fiberG || 0;
            }
          }

          const day = await tx.dietPlanDay.create({
            data: {
              dietPlanId: plan.id,
              dayNumber: dayDto.dayNumber,
              notes: dayDto.notes,
              totalCalories: dayCal,
              totalProteinG: dayP,
              totalCarbsG: dayC,
              totalFatG: dayF,
              totalFiberG: dayFib,
            },
          });

          for (const mealDto of dayDto.meals) {
            let mealCal = 0,
              mealP = 0,
              mealC = 0,
              mealF = 0,
              mealFib = 0;
            for (const item of mealDto.items) {
              mealCal += item.calories;
              mealP += item.proteinG;
              mealC += item.carbsG;
              mealF += item.fatG;
              mealFib += item.fiberG || 0;
            }

            const meal = await tx.dietMeal.create({
              data: {
                dietPlanDayId: day.id,
                mealType: mealDto.mealType,
                name: mealDto.name,
                timeSuggestion: mealDto.timeSuggestion,
                mealOrder: mealDto.mealOrder || 1,
                totalCalories: mealCal,
                totalProteinG: mealP,
                totalCarbsG: mealC,
                totalFatG: mealF,
                totalFiberG: mealFib,
              },
            });

            for (const item of mealDto.items) {
              await tx.dietMealItem.create({
                data: {
                  dietMealId: meal.id,
                  foodItemId: item.foodItemId,
                  customFoodName: item.customFoodName,
                  quantity: item.quantity || 1,
                  servingSize: item.servingSize || 100,
                  servingUnit: item.servingUnit || 'g',
                  calories: item.calories,
                  proteinG: item.proteinG,
                  carbsG: item.carbsG,
                  fatG: item.fatG,
                  fiberG: item.fiberG || 0,
                  notes: item.notes,
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
   * Find diet plan with full nested days, meals, and food items
   */
  async findOne(tenantId: string, id: string) {
    const plan = await this.prisma.dietPlan.findFirst({
      where: { id, tenantId },
      include: {
        creator: { select: { id: true, fullName: true, email: true } },
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            meals: {
              orderBy: { mealOrder: 'asc' },
              include: {
                items: {
                  include: {
                    foodItem: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Diet plan with ID ${id} not found`);
    }

    return plan;
  }

  /**
   * List diet plans in tenant (filters by customer or status)
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

    // If customer, only see own plans
    if (userRole === UserRole.CUSTOMER) {
      where.customerId = userId;
      // Customers cannot see draft/in_review plans of others
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
      this.prisma.dietPlan.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, fullName: true } },
          _count: { select: { days: true } },
        },
      }),
      this.prisma.dietPlan.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  /**
   * Copy Day within a Plan (e.g. Day 1 -> Day 2)
   */
  async copyDay(tenantId: string, planId: string, dto: CopyDayDto) {
    const plan = await this.findOne(tenantId, planId);
    const sourceDay = plan.days.find((d) => d.dayNumber === dto.sourceDayNumber);

    if (!sourceDay) {
      throw new NotFoundException(`Source day ${dto.sourceDayNumber} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Remove target day if exists
      await tx.dietPlanDay.deleteMany({
        where: { dietPlanId: planId, dayNumber: dto.targetDayNumber },
      });

      const newDay = await tx.dietPlanDay.create({
        data: {
          dietPlanId: planId,
          dayNumber: dto.targetDayNumber,
          notes: sourceDay.notes,
          totalCalories: sourceDay.totalCalories,
          totalProteinG: sourceDay.totalProteinG,
          totalCarbsG: sourceDay.totalCarbsG,
          totalFatG: sourceDay.totalFatG,
          totalFiberG: sourceDay.totalFiberG,
        },
      });

      for (const meal of sourceDay.meals) {
        const newMeal = await tx.dietMeal.create({
          data: {
            dietPlanDayId: newDay.id,
            mealType: meal.mealType,
            name: meal.name,
            timeSuggestion: meal.timeSuggestion,
            mealOrder: meal.mealOrder,
            totalCalories: meal.totalCalories,
            totalProteinG: meal.totalProteinG,
            totalCarbsG: meal.totalCarbsG,
            totalFatG: meal.totalFatG,
            totalFiberG: meal.totalFiberG,
          },
        });

        for (const item of meal.items) {
          await tx.dietMealItem.create({
            data: {
              dietMealId: newMeal.id,
              foodItemId: item.foodItemId,
              customFoodName: item.customFoodName,
              quantity: item.quantity,
              servingSize: item.servingSize,
              servingUnit: item.servingUnit,
              calories: item.calories,
              proteinG: item.proteinG,
              carbsG: item.carbsG,
              fatG: item.fatG,
              fiberG: item.fiberG,
              notes: item.notes,
            },
          });
        }
      }

      return this.findOne(tenantId, planId);
    });
  }

  /**
   * Update Diet Plan Status (Professional workflow: DRAFT -> REVIEW -> APPROVED -> ASSIGNED -> ACTIVE)
   */
  async updateStatus(
    tenantId: string,
    planId: string,
    statusDto: UpdatePlanStatusDto,
  ) {
    const plan = await this.findOne(tenantId, planId);

    // If making active, archive or complete currently active plans for this customer
    if (statusDto.status === PlanStatus.ACTIVE) {
      await this.prisma.dietPlan.updateMany({
        where: {
          tenantId,
          customerId: plan.customerId,
          status: PlanStatus.ACTIVE,
          id: { not: planId },
        },
        data: { status: PlanStatus.COMPLETED },
      });
    }

    return this.prisma.dietPlan.update({
      where: { id: planId },
      data: { status: statusDto.status },
    });
  }

  /**
   * Recalculate totals for a day after meal edit
   */
  async recalculateDayTotals(dayId: string) {
    const meals = await this.prisma.dietMeal.findMany({
      where: { dietPlanDayId: dayId },
    });

    const totals = meals.reduce(
      (acc, m) => {
        acc.calories += m.totalCalories;
        acc.protein += m.totalProteinG;
        acc.carbs += m.totalCarbsG;
        acc.fat += m.totalFatG;
        acc.fiber += m.totalFiberG;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    );

    return this.prisma.dietPlanDay.update({
      where: { id: dayId },
      data: {
        totalCalories: totals.calories,
        totalProteinG: totals.protein,
        totalCarbsG: totals.carbs,
        totalFatG: totals.fat,
        totalFiberG: totals.fiber,
      },
    });
  }
}
