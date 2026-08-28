import {
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ActivityLevel, FitnessGoal, Gender } from '@prisma/client';

export class CalculateNutritionDto {
  @IsNumber()
  @Min(10)
  @Max(120)
  age: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsNumber()
  @Min(50)
  @Max(280)
  heightCm: number;

  @IsNumber()
  @Min(20)
  @Max(400)
  currentWeightKg: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(400)
  targetWeightKg?: number;

  @IsEnum(FitnessGoal)
  fitnessGoal: FitnessGoal;

  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(7)
  workoutDaysPerWeek?: number = 4;
}

export interface NutritionCalculationResult {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  fiberTargetG: number;
  macroPercentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
  waterTargetMl: number;
}
