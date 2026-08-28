import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MealType, PlanStatus } from '@prisma/client';

export class CreateDietMealItemDto {
  @IsOptional()
  @IsString()
  foodItemId?: string;

  @IsOptional()
  @IsString()
  customFoodName?: string;

  @IsNumber()
  @Min(0.1)
  quantity: number = 1;

  @IsNumber()
  @Min(1)
  servingSize: number = 100;

  @IsOptional()
  @IsString()
  servingUnit?: string = 'g';

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  proteinG: number;

  @IsNumber()
  @Min(0)
  carbsG: number;

  @IsNumber()
  @Min(0)
  fatG: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fiberG?: number = 0;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateDietMealDto {
  @IsEnum(MealType)
  mealType: MealType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  timeSuggestion?: string;

  @IsOptional()
  @IsNumber()
  mealOrder?: number = 1;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDietMealItemDto)
  items: CreateDietMealItemDto[];
}

export class CreateDietPlanDayDto {
  @IsNumber()
  @Min(1)
  dayNumber: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDietMealDto)
  meals: CreateDietMealDto[];
}

export class CreateDietPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsNumber()
  @Min(1)
  durationDays: number = 7;

  @IsNumber()
  @Min(500)
  targetCalories: number;

  @IsNumber()
  @Min(0)
  targetProteinG: number;

  @IsNumber()
  @Min(0)
  targetCarbsG: number;

  @IsNumber()
  @Min(0)
  targetFatG: number;

  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus = PlanStatus.DRAFT;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDietPlanDayDto)
  days?: CreateDietPlanDayDto[];
}

export class CopyDayDto {
  @IsNumber()
  @Min(1)
  sourceDayNumber: number;

  @IsNumber()
  @Min(1)
  targetDayNumber: number;
}

export class UpdatePlanStatusDto {
  @IsEnum(PlanStatus)
  status: PlanStatus;
}
