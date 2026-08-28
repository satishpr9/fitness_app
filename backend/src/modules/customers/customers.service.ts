import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
   * Get customer profile
   */
  async getProfile(userId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        assignedTrainer: {
          select: { id: true, fullName: true, email: true },
        },
        assignedNutritionist: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Customer profile not found');
    }

    return profile;
  }

  /**
   * Onboarding Step 1: Personal Info
   */
  async updatePersonalInfo(userId: string, dto: Step1PersonalInfo) {
    return this.prisma.customerProfile.update({
      where: { userId },
      data: {
        age: dto.age,
        gender: dto.gender,
        heightCm: dto.heightCm,
        currentWeightKg: dto.currentWeightKg,
        targetWeightKg: dto.targetWeightKg,
        onboardingStep: Math.max(2, (await this.getStep(userId))),
      },
    });
  }

  /**
   * Onboarding Step 2: Fitness Goals & Preferences
   */
  async updateFitnessGoals(userId: string, dto: Step2FitnessGoals) {
    return this.prisma.customerProfile.update({
      where: { userId },
      data: {
        fitnessGoal: dto.fitnessGoal,
        activityLevel: dto.activityLevel,
        workoutExperience: dto.workoutExperience,
        workoutDaysPerWeek: dto.workoutDaysPerWeek,
        workoutDurationMinutes: dto.workoutDurationMinutes,
        availableEquipment: dto.availableEquipment,
        onboardingStep: Math.max(3, (await this.getStep(userId))),
      },
    });
  }

  /**
   * Onboarding Step 3: Dietary Preferences
   */
  async updateDietaryPreferences(userId: string, dto: Step3DietaryPreferences) {
    return this.prisma.customerProfile.update({
      where: { userId },
      data: {
        dietaryPreference: dto.dietaryPreference,
        allergies: dto.allergies,
        foodDislikes: dto.foodDislikes,
        preferredCuisines: dto.preferredCuisines,
        mealsPerDay: dto.mealsPerDay,
        dailyFoodBudget: dto.dailyFoodBudget,
        onboardingStep: Math.max(4, (await this.getStep(userId))),
      },
    });
  }

  /**
   * Onboarding Step 4: Lifestyle & Hydration + Mark complete and calculate targets
   */
  async updateLifestyle(userId: string, dto: Step4Lifestyle) {
    const profile = await this.prisma.customerProfile.update({
      where: { userId },
      data: {
        sleepDurationHours: dto.sleepDurationHours,
        dailyWaterTargetMl: dto.dailyWaterTargetMl,
        isOnboardingCompleted: true,
        onboardingStep: 4,
      },
    });

    // Automatically calculate & persist deterministic nutrition targets
    await this.calculateAndSaveInitialTargets(profile.tenantId, userId, profile);

    return profile;
  }

  /**
   * Complete All-in-One Onboarding
   */
  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    const profile = await this.prisma.customerProfile.update({
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

    // Record initial weight log entry
    await this.prisma.weightLog.create({
      data: {
        tenantId: profile.tenantId,
        userId,
        date: new Date(),
        weightKg: dto.currentWeightKg,
        notes: 'Initial onboarding weight',
      },
    });

    // Automatically calculate & persist deterministic nutrition targets
    await this.calculateAndSaveInitialTargets(profile.tenantId, userId, profile);

    return profile;
  }

  /**
   * Assign Trainer and/or Nutritionist to Customer (Tenant Admin)
   */
  async assignProfessionals(
    tenantId: string,
    customerId: string,
    trainerId?: string,
    nutritionistId?: string,
  ) {
    const customer = await this.prisma.customerProfile.findFirst({
      where: { tenantId, userId: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found in this organization');
    }

    if (trainerId) {
      const trainer = await this.prisma.tenantUser.findFirst({
        where: { tenantId, userId: trainerId, role: 'TRAINER' },
      });
      if (!trainer) {
        throw new BadRequestException('Trainer not found in this organization');
      }
    }

    if (nutritionistId) {
      const nutritionist = await this.prisma.tenantUser.findFirst({
        where: { tenantId, userId: nutritionistId, role: 'NUTRITIONIST' },
      });
      if (!nutritionist) {
        throw new BadRequestException('Nutritionist not found in this organization');
      }
    }

    return this.prisma.customerProfile.update({
      where: { id: customer.id },
      data: {
        assignedTrainerId: trainerId !== undefined ? trainerId : customer.assignedTrainerId,
        assignedNutritionistId:
          nutritionistId !== undefined ? nutritionistId : customer.assignedNutritionistId,
      },
      include: {
        assignedTrainer: true,
        assignedNutritionist: true,
      },
    });
  }

  /**
   * List customers in tenant (for Admin, Trainer, Nutritionist)
   */
  async getTenantCustomers(
    tenantId: string,
    userRole: string,
    professionalUserId?: string,
    limit = 20,
    offset = 0,
  ) {
    const where: any = { tenantId };

    // If trainer, only show assigned customers
    if (userRole === 'TRAINER' && professionalUserId) {
      where.assignedTrainerId = professionalUserId;
    }

    // If nutritionist, only show assigned customers
    if (userRole === 'NUTRITIONIST' && professionalUserId) {
      where.assignedNutritionistId = professionalUserId;
    }

    const [items, total] = await Promise.all([
      this.prisma.customerProfile.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
              avatarUrl: true,
            },
          },
          assignedTrainer: {
            select: { id: true, fullName: true },
          },
          assignedNutritionist: {
            select: { id: true, fullName: true },
          },
        },
      }),
      this.prisma.customerProfile.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  private async getStep(userId: string): Promise<number> {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      select: { onboardingStep: true },
    });
    return profile?.onboardingStep || 1;
  }

  private async calculateAndSaveInitialTargets(
    tenantId: string,
    userId: string,
    profile: any,
  ) {
    if (!profile.age || !profile.gender || !profile.heightCm || !profile.currentWeightKg) {
      return;
    }

    const calculated = this.calculator.calculateNutrition({
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      currentWeightKg: profile.currentWeightKg,
      targetWeightKg: profile.targetWeightKg,
      fitnessGoal: profile.fitnessGoal || ('GENERAL_FITNESS' as any),
      activityLevel: profile.activityLevel || ('MODERATELY_ACTIVE' as any),
      workoutDaysPerWeek: profile.workoutDaysPerWeek || 4,
    });

    await this.prisma.nutritionTarget.create({
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
}
