import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import {
  CalculateNutritionDto,
  NutritionCalculationResult,
} from './dto/nutrition-calculation.dto';

@Injectable()
export class NutritionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: NutritionCalculatorService,
  ) {}

  /**
   * Calculate targets deterministically given user metrics
   */
  calculateTargets(dto: CalculateNutritionDto): NutritionCalculationResult {
    return this.calculator.calculateNutrition(dto);
  }

  /**
   * Get or calculate and persist current user's nutrition targets
   */
  async getUserTargets(tenantId: string, userId: string) {
    // Check if target already exists
    const existing = await this.prisma.nutritionTarget.findFirst({
      where: { tenantId, userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      return existing;
    }

    // Retrieve customer profile to calculate
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.age || !profile.gender || !profile.heightCm || !profile.currentWeightKg) {
      throw new NotFoundException(
        'Complete onboarding profile required before calculating nutrition targets',
      );
    }

    const calculated = this.calculator.calculateNutrition({
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      currentWeightKg: profile.currentWeightKg,
      targetWeightKg: profile.targetWeightKg,
      fitnessGoal: profile.fitnessGoal || 'GENERAL_FITNESS' as any,
      activityLevel: profile.activityLevel || 'MODERATELY_ACTIVE' as any,
      workoutDaysPerWeek: profile.workoutDaysPerWeek || 4,
    });

    return this.prisma.nutritionTarget.create({
      data: {
        tenantId,
        userId,
        bmi: calculated.bmi,
        bmr: calculated.bmr,
        tdee: calculated.tdee,
        dailyCalorieTarget: calculated.dailyCalorieTarget,
        proteinTargetG: calculated.proteinTargetG,
        carbsTargetG: calculated.carbsTargetG,
        fatTargetG: calculated.fatTargetG,
        fiberTargetG: calculated.fiberTargetG,
        isCustomOverride: false,
      },
    });
  }

  /**
   * Allow trainer or nutritionist or admin to override target values
   */
  async overrideUserTargets(
    tenantId: string,
    userId: string,
    overriddenById: string,
    overrides: {
      dailyCalorieTarget?: number;
      proteinTargetG?: number;
      carbsTargetG?: number;
      fatTargetG?: number;
      fiberTargetG?: number;
      notes?: string;
    },
  ) {
    const current = await this.getUserTargets(tenantId, userId);

    return this.prisma.nutritionTarget.update({
      where: { id: current.id },
      data: {
        dailyCalorieTarget: overrides.dailyCalorieTarget ?? current.dailyCalorieTarget,
        proteinTargetG: overrides.proteinTargetG ?? current.proteinTargetG,
        carbsTargetG: overrides.carbsTargetG ?? current.carbsTargetG,
        fatTargetG: overrides.fatTargetG ?? current.fatTargetG,
        fiberTargetG: overrides.fiberTargetG ?? current.fiberTargetG,
        notes: overrides.notes ?? current.notes,
        isCustomOverride: true,
        overriddenById,
      },
    });
  }
}
