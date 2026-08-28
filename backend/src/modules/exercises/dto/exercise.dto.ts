import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Difficulty,
  Equipment,
  ExerciseCategory,
  MuscleGroup,
} from '@prisma/client';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ExerciseCategory)
  category?: ExerciseCategory = ExerciseCategory.STRENGTH;

  @IsEnum(MuscleGroup)
  muscleGroup: MuscleGroup;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryMuscles?: string[] = [];

  @IsOptional()
  @IsEnum(Equipment)
  equipment?: Equipment = Equipment.BARBELL;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty = Difficulty.BEGINNER;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instructions?: string[] = [];
}

export class ExerciseSearchQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(MuscleGroup)
  muscleGroup?: MuscleGroup;

  @IsOptional()
  @IsEnum(Equipment)
  equipment?: Equipment;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(ExerciseCategory)
  category?: ExerciseCategory;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  offset?: number = 0;
}
