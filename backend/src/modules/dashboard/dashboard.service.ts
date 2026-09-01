import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { MealType, PlanStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate complete Customer Dashboard
   */
  async getCustomerDashboard(userId: string) {
    // UTC-safe date for @db.Date queries
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);
    const dayOfWeek = new Date().getDay();

    const hour = new Date().getHours();
    let greeting = 'Good Morning 👋';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon ☀️';
    else if (hour >= 17) greeting = 'Good Evening 🌙';

    const [
      profile,
      nutritionTarget,
      todayFoodLogs,
      activeWorkoutPlan,
      todayWorkoutLog,
      todayWaterLogs,
      recentWorkoutLogs,
    ] = await Promise.all([
      this.prisma.profile.findUnique({
        where: { userId },
        include: {
          user: { select: { fullName: true, avatarUrl: true, tier: true } },
        },
      }),
      this.prisma.nutritionTarget.findUnique({
        where: { userId },
      }),
      this.prisma.foodLog.findMany({
        where: { userId, date: today },
      }),
      this.prisma.workoutPlan.findFirst({
        where: { userId, status: PlanStatus.ACTIVE },
        include: {
          days: {
            where: { dayNumber: dayOfWeek === 0 ? 7 : dayOfWeek },
            include: {
              exercises: {
                include: { exercise: true },
              },
            },
          },
        },
      }),
      this.prisma.workoutLog.findFirst({
        where: { userId, date: today },
      }),
      this.prisma.waterLog.findMany({
        where: { userId, date: today },
      }),
      this.prisma.workoutLog.findMany({
        where: {
          userId,
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const calTarget = nutritionTarget?.dailyCalorieTarget ?? 2000;
    const proteinTarget = nutritionTarget?.proteinTargetG ?? 130;
    const carbsTarget = nutritionTarget?.carbsTargetG ?? 220;
    const fatTarget = nutritionTarget?.fatTargetG ?? 65;

    let calConsumed = 0;
    let proteinConsumed = 0;
    let carbsConsumed = 0;
    let fatConsumed = 0;

    const loggedMealTypes = new Set<string>();
    for (const log of todayFoodLogs) {
      calConsumed += log.calories;
      proteinConsumed += log.proteinG;
      carbsConsumed += log.carbsG;
      fatConsumed += log.fatG;
      loggedMealTypes.add(log.mealType);
    }

    const waterConsumedMl = todayWaterLogs.reduce((acc, l) => acc + l.amountMl, 0);
    const waterTargetMl = profile?.dailyWaterTargetMl ?? 2500;

    const todayDay = activeWorkoutPlan?.days[0];

    return {
      greeting,
      userName: profile?.user?.fullName || 'Athlete',
      avatarUrl: profile?.user?.avatarUrl,
      tier: profile?.user?.tier,
      weight: {
        current: profile?.currentWeightKg ?? 70,
        target: profile?.targetWeightKg ?? 68,
      },
      calories: {
        consumed: Math.round(calConsumed),
        target: Math.round(calTarget),
        remaining: Math.max(0, Math.round(calTarget - calConsumed)),
      },
      macros: {
        protein: { consumed: Math.round(proteinConsumed), target: Math.round(proteinTarget) },
        carbs: { consumed: Math.round(carbsConsumed), target: Math.round(carbsTarget) },
        fat: { consumed: Math.round(fatConsumed), target: Math.round(fatTarget) },
      },
      todayMeals: {
        breakfastLogged: loggedMealTypes.has(MealType.BREAKFAST),
        lunchLogged: loggedMealTypes.has(MealType.LUNCH),
        snackLogged:
          loggedMealTypes.has(MealType.MORNING_SNACK) || loggedMealTypes.has(MealType.EVENING_SNACK),
        dinnerLogged: loggedMealTypes.has(MealType.DINNER),
      },
      todayWorkout: {
        isCompleted: !!todayWorkoutLog,
        planTitle: activeWorkoutPlan?.name,
        todaySessionName: todayDay?.dayName || 'Rest Day',
        isRestDay: todayDay ? todayDay.isRestDay : true,
        exercisesCount: todayDay?.exercises?.length || 0,
      },
      water: {
        consumedMl: waterConsumedMl,
        targetMl: waterTargetMl,
        glassesConsumed: Number((waterConsumedMl / 250).toFixed(1)),
        targetGlasses: Math.ceil(waterTargetMl / 250),
      },
      streak: {
        workoutsThisWeek: recentWorkoutLogs.length,
      },
    };
  }
}
