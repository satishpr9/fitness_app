import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  ActivityLevel,
  DietaryPreference,
  FitnessGoal,
  Gender,
  WorkoutExperience,
} from '@prisma/client';

export class Step1PersonalInfo {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsNumber()
  @Min(12)
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
}

export class Step2FitnessGoals {
  @IsEnum(FitnessGoal)
  fitnessGoal: FitnessGoal;

  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;

  @IsEnum(WorkoutExperience)
  workoutExperience: WorkoutExperience;

  @IsNumber()
  @Min(1)
  @Max(7)
  workoutDaysPerWeek: number;

  @IsNumber()
  @Min(15)
  @Max(180)
  workoutDurationMinutes: number;

  @IsArray()
  @IsString({ each: true })
  availableEquipment: string[];
}

export class Step3DietaryPreferences {
  @IsEnum(DietaryPreference)
  dietaryPreference: DietaryPreference;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foodDislikes?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCuisines?: string[] = ['Indian'];

  @IsNumber()
  @Min(1)
  @Max(8)
  mealsPerDay: number;

  @IsOptional()
  @IsNumber()
  dailyFoodBudget?: number;
}

export class Step4Lifestyle {
  @IsNumber()
  @Min(3)
  @Max(16)
  sleepDurationHours: number;

  @IsNumber()
  @Min(1000)
  @Max(10000)
  dailyWaterTargetMl: number;
}

export class CompleteOnboardingDto {
  @IsNumber()
  @Min(12)
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

  @IsEnum(WorkoutExperience)
  workoutExperience: WorkoutExperience;

  @IsNumber()
  @Min(1)
  @Max(7)
  workoutDaysPerWeek: number;

  @IsNumber()
  @Min(15)
  @Max(180)
  workoutDurationMinutes: number;

  @IsArray()
  @IsString({ each: true })
  availableEquipment: string[];

  @IsEnum(DietaryPreference)
  dietaryPreference: DietaryPreference;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foodDislikes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCuisines?: string[];

  @IsNumber()
  @Min(1)
  @Max(8)
  mealsPerDay: number;

  @IsOptional()
  @IsNumber()
  dailyFoodBudget?: number;

  @IsOptional()
  @IsNumber()
  sleepDurationHours?: number;

  @IsOptional()
  @IsNumber()
  dailyWaterTargetMl?: number;
}

export class AssignProfessionalDto {
  @IsOptional()
  @IsString()
  trainerId?: string;

  @IsOptional()
  @IsString()
  nutritionistId?: string;
}
