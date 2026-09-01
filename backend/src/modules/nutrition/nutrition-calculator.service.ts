import { Injectable } from '@nestjs/common';
import { ActivityLevel, FitnessGoal, Gender } from '@prisma/client';
import {
  CalculateNutritionDto,
  NutritionCalculationResult,
} from './dto/nutrition-calculation.dto';

@Injectable()
export class NutritionCalculatorService {
  /**
   * Activity level multipliers for TDEE calculation
   */
  private readonly activityMultipliers: Record<ActivityLevel, number> = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
    [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
    [ActivityLevel.VERY_ACTIVE]: 1.725,
    [ActivityLevel.EXTRA_ACTIVE]: 1.9,
  };

  /**
   * Calorie adjustments based on fitness goal
   */
  private readonly goalCalorieAdjustments: Record<FitnessGoal, number> = {
    [FitnessGoal.WEIGHT_LOSS]: -500,
    [FitnessGoal.MUSCLE_GAIN]: 350,
    [FitnessGoal.MAINTENANCE]: 0,
    [FitnessGoal.GENERAL_FITNESS]: 0,
    [FitnessGoal.STRENGTH]: 250,
    [FitnessGoal.ENDURANCE]: 200,
  };

  /**
   * Macro distribution percentages [Protein%, Carbs%, Fat%] by goal
   */
  private readonly macroSplits: Record<
    FitnessGoal,
    { protein: number; carbs: number; fat: number }
  > = {
    [FitnessGoal.WEIGHT_LOSS]: { protein: 0.35, carbs: 0.35, fat: 0.3 },
    [FitnessGoal.MUSCLE_GAIN]: { protein: 0.3, carbs: 0.45, fat: 0.25 },
    [FitnessGoal.MAINTENANCE]: { protein: 0.25, carbs: 0.45, fat: 0.3 },
    [FitnessGoal.GENERAL_FITNESS]: { protein: 0.25, carbs: 0.45, fat: 0.3 },
    [FitnessGoal.STRENGTH]: { protein: 0.3, carbs: 0.45, fat: 0.25 },
    [FitnessGoal.ENDURANCE]: { protein: 0.2, carbs: 0.55, fat: 0.25 },
  };

  /**
   * Deterministic BMI Calculation
   * BMI = weight (kg) / (height (m))^2
   */
  calculateBmi(weightKg: number, heightCm: number): { bmi: number; category: string } {
    const heightMeters = heightCm / 100;
    const bmi = Number((weightKg / (heightMeters * heightMeters)).toFixed(1));

    let category = 'Normal weight';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else if (bmi >= 30) category = 'Obesity';

    return { bmi, category };
  }

  /**
   * Deterministic BMR Calculation using Mifflin-St Jeor Equation
   * Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
   * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
   */
  calculateBmr(weightKg: number, heightCm: number, age: number, gender: Gender): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    const bmr = gender === Gender.MALE ? base + 5 : base - 161;
    return Math.round(bmr);
  }

  /**
   * Deterministic TDEE (Total Daily Energy Expenditure) Calculation
   * TDEE = BMR * ActivityMultiplier
   */
  calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
    const multiplier = this.activityMultipliers[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
  }

  /**
   * Complete deterministic calculation of daily calories, macros, fiber, and hydration
   */
  calculateNutrition(dto: CalculateNutritionDto): NutritionCalculationResult {
    const { bmi, category: bmiCategory } = this.calculateBmi(
      dto.currentWeightKg,
      dto.heightCm,
    );

    const bmr = this.calculateBmr(
      dto.currentWeightKg,
      dto.heightCm,
      dto.age,
      dto.gender,
    );

    const tdee = this.calculateTdee(bmr, dto.activityLevel);

    // Goal adjustment
    const adjustment = this.goalCalorieAdjustments[dto.fitnessGoal] || 0;
    let dailyCalorieTarget = tdee + adjustment;

    // Minimum safe calorie floor (1500 for men, 1200 for women)
    const minSafeCalories = dto.gender === Gender.MALE ? 1500 : 1200;
    if (dailyCalorieTarget < minSafeCalories) {
      dailyCalorieTarget = minSafeCalories;
    }

    // Macro Split calculation
    const split = this.macroSplits[dto.fitnessGoal] || {
      protein: 0.25,
      carbs: 0.45,
      fat: 0.3,
    };

    // 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal
    const proteinCalories = dailyCalorieTarget * split.protein;
    const carbsCalories = dailyCalorieTarget * split.carbs;
    const fatCalories = dailyCalorieTarget * split.fat;

    const proteinTargetG = Math.round(proteinCalories / 4);
    const carbsTargetG = Math.round(carbsCalories / 4);
    const fatTargetG = Math.round(fatCalories / 9);

    // Fiber: ~14g per 1000 kcal (minimum 25g, max 45g)
    const fiberTargetG = Math.min(
      45,
      Math.max(25, Math.round((dailyCalorieTarget / 1000) * 14)),
    );

    // Water target: 35ml per kg + workout hydration bonus
    const workoutBonus = (dto.workoutDaysPerWeek ?? 4) > 0 ? 500 : 0;
    const waterTargetMl = Math.round(dto.currentWeightKg * 35 + workoutBonus);

    return {
      bmi,
      bmiCategory,
      bmr,
      tdee,
      dailyCalorieTarget,
      proteinTargetG,
      carbsTargetG,
      fatTargetG,
      fiberTargetG,
      macroPercentages: {
        protein: Math.round(split.protein * 100),
        carbs: Math.round(split.carbs * 100),
        fat: Math.round(split.fat * 100),
      },
      waterTargetMl,
    };
  }
}
