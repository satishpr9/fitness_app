import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateFoodItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  category?: string = 'Other';

  @IsNumber()
  @Min(1)
  servingSize: number = 100;

  @IsString()
  @IsOptional()
  servingUnit?: string = 'g';

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  protein: number;

  @IsNumber()
  @Min(0)
  carbs: number;

  @IsNumber()
  @Min(0)
  fat: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sugar?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sodium?: number = 0;

  @IsOptional()
  @IsString()
  cuisine?: string = 'Indian';

  @IsOptional()
  @IsBoolean()
  isVegetarian?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isVegan?: boolean = false;
}

export class FoodSearchQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVegetarian?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVegan?: boolean;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  offset?: number = 0;
}
