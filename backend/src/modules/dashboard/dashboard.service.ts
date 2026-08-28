import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { MealType, PlanStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate complete Customer Dashboard
   */
  async getCustomerDashboard(tenantId: string, userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDateStr = today.toISOString().split('T')[0];

    // Determine greeting
    const hour = new Date().getHours();
    let greeting = 'Good Morning 👋';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon ☀️';
    else if (hour >= 17) greeting = 'Good Evening 🌙';

    const [
      profile,
      nutritionTarget,
      todayFoodLogs,
      activeDietPlan,
      activeWorkoutPlan,
      todayWorkoutLog,
      todayWaterLogs,
      recentWorkoutLogs,
    ] = await Promise.all([
      this.prisma.customerProfile.findUnique({
        where: { userId },
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
          assignedTrainer: { select: { fullName: true } },
          assignedNutritionist: { select: { fullName: true } },
        },
      }),
      this.prisma.nutritionTarget.findFirst({
        where: { tenantId, userId },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.foodLog.findMany({
        where: { tenantId, userId, date: today },
      }),
      this.prisma.dietPlan.findFirst({
        where: { tenantId, customerId: userId, status: PlanStatus.ACTIVE },
        include: {
          days: {
            where: { dayNumber: 1 },
            include: { meals: true },
          },
        },
      }),
      this.prisma.workoutPlan.findFirst({
        where: { tenantId, customerId: userId, status: PlanStatus.ACTIVE },
        include: {
          days: {
            where: { dayNumber: (today.getDay() === 0 ? 7 : today.getDay()) },
            include: {
              exercises: {
                include: { exercise: true },
              },
            },
          },
        },
      }),
      this.prisma.workoutLog.findFirst({
        where: { tenantId, userId, date: today },
      }),
      this.prisma.waterLog.findMany({
        where: { tenantId, userId, date: today },
      }),
      this.prisma.workoutLog.findMany({
        where: {
          tenantId,
          userId,
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // Nutrition aggregates
    const calTarget = nutritionTarget?.dailyCalorieTarget || 2000;
    const proteinTarget = nutritionTarget?.proteinTargetG || 130;
    const carbsTarget = nutritionTarget?.carbsTargetG || 220;
    const fatTarget = nutritionTarget?.fatTargetG || 65;

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

    // Water aggregates
    const waterConsumedMl = todayWaterLogs.reduce((acc, l) => acc + l.amountMl, 0);
    const waterTargetMl = profile?.dailyWaterTargetMl || 2500;

    return {
      greeting,
      userName: profile?.user?.fullName || 'Athlete',
      avatarUrl: profile?.user?.avatarUrl,
      weight: {
        current: profile?.currentWeightKg || 70,
        target: profile?.targetWeightKg || 68,
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
        snackLogged: loggedMealTypes.has(MealType.MORNING_SNACK) || loggedMealTypes.has(MealType.EVENING_SNACK),
        dinnerLogged: loggedMealTypes.has(MealType.DINNER),
      },
      todayWorkout: {
        isCompleted: !!todayWorkoutLog,
        planTitle: activeWorkoutPlan?.name,
        todaySessionName: activeWorkoutPlan?.days[0]?.dayName || 'Rest Day',
        isRestDay: activeWorkoutPlan?.days[0]?.isRestDay ?? false,
        exercisesCount: activeWorkoutPlan?.days[0]?.exercises?.length || 0,
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

  /**
   * Aggregate Organization Dashboard for Tenant Administrators
   */
  async getTenantDashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      totalTrainers,
      totalNutritionists,
      activeDietPlans,
      activeWorkoutPlans,
      recentWorkoutsCount,
      newRegistrationsCount,
    ] = await Promise.all([
      this.prisma.customerProfile.count({ where: { tenantId } }),
      this.prisma.tenantUser.count({ where: { tenantId, role: 'TRAINER', status: 'ACTIVE' } }),
      this.prisma.tenantUser.count({ where: { tenantId, role: 'NUTRITIONIST', status: 'ACTIVE' } }),
      this.prisma.dietPlan.count({ where: { tenantId, status: PlanStatus.ACTIVE } }),
      this.prisma.workoutPlan.count({ where: { tenantId, status: PlanStatus.ACTIVE } }),
      this.prisma.workoutLog.count({ where: { tenantId, date: { gte: thirtyDaysAgo } } }),
      this.prisma.tenantUser.count({
        where: { tenantId, role: 'CUSTOMER', createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    return {
      overview: {
        totalCustomers,
        totalTrainers,
        totalNutritionists,
        activeDietPlans,
        activeWorkoutPlans,
        completedWorkouts30Days: recentWorkoutsCount,
        newRegistrations30Days: newRegistrationsCount,
      },
    };
  }
}
