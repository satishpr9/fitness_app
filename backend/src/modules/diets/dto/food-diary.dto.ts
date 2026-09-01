import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MealType } from '@prisma/client';

export class LogFoodDto {
  @IsDateString()
  date: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsOptional()
  @IsString()
  foodItemId?: string;

  @IsString()
  @IsNotEmpty()
  foodName: string;

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
  photoUrl?: string;
}
