import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { NutritionCalculatorService } from '../nutrition/nutrition-calculator.service';
import {
  CompleteOnboardingDto,
  Step1PersonalInfo,
  Step2FitnessGoals,
  Step3DietaryPreferences,
  Step4Lifestyle,
} from './dto/onboarding.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: NutritionCalculatorService,
  ) {}

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
            tier: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }

  /**
   * Onboarding Step 1: Personal Info
   */
  async updatePersonalInfo(userId: string, dto: Step1PersonalInfo) {
    if (dto.fullName) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fullName: dto.fullName },
      });
    }

    return this.prisma.profile.update({
      where: { userId },
      data: {
        age: dto.age,
        gender: dto.gender,
        heightCm: dto.heightCm,
        currentWeightKg: dto.currentWeightKg,
        targetWeightKg: dto.targetWeightKg,
        onboardingStep: Math.max(2, await this.getStep(userId)),
      },
    });
  }

  /**
   * Onboarding Step 2: Fitness Goals
   */
  async updateFitnessGoals(userId: string, dto: Step2FitnessGoals) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        fitnessGoal: dto.fitnessGoal,
        activityLevel: dto.activityLevel,
        workoutExperience: dto.workoutExperience,
        workoutDaysPerWeek: dto.workoutDaysPerWeek,
        workoutDurationMinutes: dto.workoutDurationMinutes,
        availableEquipment: dto.availableEquipment,
        onboardingStep: Math.max(3, await this.getStep(userId)),
      },
    });
  }

  /**
   * Onboarding Step 3: Dietary Preferences
   */
  async updateDietaryPreferences(userId: string, dto: Step3DietaryPreferences) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        dietaryPreference: dto.dietaryPreference,
        allergies: dto.allergies,
        foodDislikes: dto.foodDislikes,
        preferredCuisines: dto.preferredCuisines,
        mealsPerDay: dto.mealsPerDay,
        dailyFoodBudget: dto.dailyFoodBudget,
        onboardingStep: Math.max(4, await this.getStep(userId)),
      },
    });
  }

  /**
   * Onboarding Step 4: Lifestyle & Hydration
   */
  async updateLifestyle(userId: string, dto: Step4Lifestyle) {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        sleepDurationHours: dto.sleepDurationHours,
        dailyWaterTargetMl: dto.dailyWaterTargetMl,
        isOnboardingCompleted: true,
        onboardingStep: 4,
      },
    });

    // Record initial weight log if current weight is available
    if (profile.currentWeightKg) {
      const existingLog = await this.prisma.weightLog.findFirst({
        where: { userId },
      });
      if (!existingLog) {
        await this.prisma.weightLog.create({
          data: {
            userId,
            date: new Date(),
            weightKg: profile.currentWeightKg,
            notes: 'Initial onboarding weigh-in',
          },
        });
      }
    }

    await this.calculateAndSaveInitialTargets(userId, profile);
    return profile;
  }

  /**
   * Complete All-in-One Onboarding
   */
  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        age: dto.age,
        gender: dto.gender,
        heightCm: dto.heightCm,
        currentWeightKg: dto.currentWeightKg,
        targetWeightKg: dto.targetWeightKg,
        fitnessGoal: dto.fitnessGoal,
        activityLevel: dto.activityLevel,
        workoutExperience: dto.workoutExperience,
        workoutDaysPerWeek: dto.workoutDaysPerWeek,
        workoutDurationMinutes: dto.workoutDurationMinutes,
        availableEquipment: dto.availableEquipment,
        dietaryPreference: dto.dietaryPreference,
        allergies: dto.allergies || [],
        foodDislikes: dto.foodDislikes || [],
        preferredCuisines: dto.preferredCuisines || ['Indian'],
        mealsPerDay: dto.mealsPerDay,
        dailyFoodBudget: dto.dailyFoodBudget,
        sleepDurationHours: dto.sleepDurationHours || 7.5,
        dailyWaterTargetMl: dto.dailyWaterTargetMl || 2500,
        isOnboardingCompleted: true,
        onboardingStep: 4,
      },
    });

    // Record initial weight log
    const existingLog = await this.prisma.weightLog.findFirst({
      where: { userId },
    });
    if (!existingLog) {
      await this.prisma.weightLog.create({
        data: {
          userId,
          date: new Date(),
          weightKg: dto.currentWeightKg,
          notes: 'Initial onboarding weigh-in',
        },
      });
    }

    // Calculate deterministic nutrition targets
    await this.calculateAndSaveInitialTargets(userId, profile);

    return profile;
  }

  private async getStep(userId: string): Promise<number> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { onboardingStep: true },
    });
    return profile?.onboardingStep || 1;
  }

  private async calculateAndSaveInitialTargets(userId: string, profile: any) {
    if (!profile.age || !profile.gender || !profile.heightCm || !profile.currentWeightKg) {
      return;
    }

    const calculated = this.calculator.calculateNutrition({
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      currentWeightKg: profile.currentWeightKg,
      targetWeightKg: profile.targetWeightKg ?? undefined,
      fitnessGoal: profile.fitnessGoal ?? ('GENERAL_FITNESS' as any),
      activityLevel: profile.activityLevel ?? ('MODERATELY_ACTIVE' as any),
      workoutDaysPerWeek: profile.workoutDaysPerWeek ?? 4,
    });

    await this.prisma.nutritionTarget.upsert({
      where: { userId },
      create: {
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
      update: {
        bmi: calculated.bmi,
        bmr: calculated.bmr,
        tdee: calculated.tdee,
        dailyCalorieTarget: calculated.dailyCalorieTarget,
        proteinTargetG: calculated.proteinTargetG,
        carbsTargetG: calculated.carbsTargetG,
        fatTargetG: calculated.fatTargetG,
        fiberTargetG: calculated.fiberTargetG,
      },
    });
  }
}
