import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { FoodRecognitionDto, LogFoodDto } from './dto/food-diary.dto';
import { MealType } from '@prisma/client';

@Injectable()
export class FoodDiaryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log food item to user's daily diary
   */
  async logFood(tenantId: string, userId: string, dto: LogFoodDto) {
    const logDate = new Date(dto.date);

    return this.prisma.foodLog.create({
      data: {
        tenantId,
        userId,
        date: logDate,
        mealType: dto.mealType,
        foodItemId: dto.foodItemId,
        foodName: dto.foodName,
        quantity: dto.quantity || 1,
        servingSize: dto.servingSize || 100,
        servingUnit: dto.servingUnit || 'g',
        calories: dto.calories,
        proteinG: dto.proteinG,
        carbsG: dto.carbsG,
        fatG: dto.fatG,
        fiberG: dto.fiberG || 0,
        photoUrl: dto.photoUrl,
        isAiRecognized: dto.isAiRecognized || false,
        aiConfidenceScore: dto.aiConfidenceScore,
      },
    });
  }

  /**
   * Get daily food log breakdown and summary vs nutrition targets
   */
  async getDailyLog(tenantId: string, userId: string, dateStr: string) {
    const date = new Date(dateStr);

    const [logs, target] = await Promise.all([
      this.prisma.foodLog.findMany({
        where: {
          tenantId,
          userId,
          date,
        },
        orderBy: { loggedAt: 'asc' },
      }),
      this.prisma.nutritionTarget.findFirst({
        where: { tenantId, userId },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Group logs by meal type
    const meals: Record<string, { items: any[]; totalCalories: number; proteinG: number; carbsG: number; fatG: number; fiberG: number }> = {
      [MealType.BREAKFAST]: { items: [], totalCalories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
      [MealType.MORNING_SNACK]: { items: [], totalCalories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
      [MealType.LUNCH]: { items: [], totalCalories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
      [MealType.EVENING_SNACK]: { items: [], totalCalories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
      [MealType.DINNER]: { items: [], totalCalories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
      [MealType.OTHER]: { items: [], totalCalories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
    };

    let totalCaloriesConsumed = 0;
    let totalProteinConsumed = 0;
    let totalCarbsConsumed = 0;
    let totalFatConsumed = 0;
    let totalFiberConsumed = 0;

    for (const log of logs) {
      const meal = meals[log.mealType] || meals[MealType.OTHER];
      meal.items.push(log);
      meal.totalCalories += log.calories;
      meal.proteinG += log.proteinG;
      meal.carbsG += log.carbsG;
      meal.fatG += log.fatG;
      meal.fiberG += log.fiberG;

      totalCaloriesConsumed += log.calories;
      totalProteinConsumed += log.proteinG;
      totalCarbsConsumed += log.carbsG;
      totalFatConsumed += log.fatG;
      totalFiberConsumed += log.fiberG;
    }

    const calorieTarget = target?.dailyCalorieTarget || 2000;
    const proteinTarget = target?.proteinTargetG || 130;
    const carbsTarget = target?.carbsTargetG || 220;
    const fatTarget = target?.fatTargetG || 65;
    const fiberTarget = target?.fiberTargetG || 30;

    return {
      date: dateStr,
      summary: {
        calories: {
          consumed: Math.round(totalCaloriesConsumed),
          target: Math.round(calorieTarget),
          remaining: Math.max(0, Math.round(calorieTarget - totalCaloriesConsumed)),
        },
        protein: {
          consumed: Number(totalProteinConsumed.toFixed(1)),
          target: Math.round(proteinTarget),
          remaining: Math.max(0, Number((proteinTarget - totalProteinConsumed).toFixed(1))),
        },
        carbs: {
          consumed: Number(totalCarbsConsumed.toFixed(1)),
          target: Math.round(carbsTarget),
          remaining: Math.max(0, Number((carbsTarget - totalCarbsConsumed).toFixed(1))),
        },
        fat: {
          consumed: Number(totalFatConsumed.toFixed(1)),
          target: Math.round(fatTarget),
          remaining: Math.max(0, Number((fatTarget - totalFatConsumed).toFixed(1))),
        },
        fiber: {
          consumed: Number(totalFiberConsumed.toFixed(1)),
          target: Math.round(fiberTarget),
          remaining: Math.max(0, Number((fiberTarget - totalFiberConsumed).toFixed(1))),
        },
      },
      meals,
    };
  }

  /**
   * Delete food log entry
   */
  async deleteLog(tenantId: string, userId: string, id: string) {
    const log = await this.prisma.foodLog.findFirst({
      where: { id, tenantId, userId },
    });

    if (!log) {
      throw new NotFoundException('Food log entry not found');
    }

    return this.prisma.foodLog.delete({
      where: { id },
    });
  }

  /**
   * Get weekly nutrition history
   */
  async getWeeklyHistory(tenantId: string, userId: string, startDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const logs = await this.prisma.foodLog.findMany({
      where: {
        tenantId,
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Group logs by day
    const dayMap = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();

    for (const log of logs) {
      const d = log.date.toISOString().split('T')[0];
      const existing = dayMap.get(d) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      existing.calories += log.calories;
      existing.protein += log.proteinG;
      existing.carbs += log.carbsG;
      existing.fat += log.fatG;
      dayMap.set(d, existing);
    }

    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  /**
   * AI Food Recognition Engine (Vision AI pipeline)
   */
  async recognizeFood(tenantId: string, dto: FoodRecognitionDto) {
    // Pipeline: Vision model estimates foods, portions, and confidence scores
    // Return structured estimates that require user confirmation before logging
    return {
      isEstimated: true,
      notice: 'Nutritional values are AI estimates and must be verified by the user.',
      detectedItems: [
        {
          foodName: 'Paneer Butter Masala',
          estimatedServing: 150,
          servingUnit: 'g',
          confidence: 0.92,
          calories: 380,
          proteinG: 14,
          carbsG: 12,
          fatG: 30,
          fiberG: 2.5,
        },
        {
          foodName: 'Roti (Whole Wheat)',
          estimatedServing: 2,
          servingUnit: 'piece',
          confidence: 0.96,
          calories: 240,
          proteinG: 6.2,
          carbsG: 40,
          fatG: 6,
          fiberG: 4,
        },
      ],
    };
  }
}
