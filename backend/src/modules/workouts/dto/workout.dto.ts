import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty, PlanStatus } from '@prisma/client';

export class CreateWorkoutDayExerciseDto {
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsOptional()
  @IsNumber()
  orderInDay?: number = 1;

  @IsNumber()
  @Min(1)
  sets: number = 3;

  @IsOptional()
  @IsNumber()
  @Min(1)
  reps?: number = 10;

  @IsOptional()
  @IsNumber()
  targetWeightKg?: number;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsNumber()
  restTimeSeconds?: number = 60;

  @IsOptional()
  @IsString()
  tempo?: string = '2-0-2-0';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateWorkoutDayDto {
  @IsNumber()
  @Min(1)
  @Max(7)
  dayNumber: number;

  @IsString()
  @IsNotEmpty()
  dayName: string;

  @IsOptional()
  @IsBoolean()
  isRestDay?: boolean = false;

  @IsOptional()
  @IsNumber()
  targetDurationMinutes?: number = 45;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutDayExerciseDto)
  exercises?: CreateWorkoutDayExerciseDto[] = [];
}

export class CreateWorkoutPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationWeeks?: number = 4;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty = Difficulty.BEGINNER;

  @IsOptional()
  @IsString()
  goal?: string = 'General Fitness';

  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus = PlanStatus.DRAFT;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutDayDto)
  days?: CreateWorkoutDayDto[] = [];
}

export class LogExerciseSetDto {
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsNumber()
  @Min(1)
  setNumber: number;

  @IsNumber()
  @Min(0)
  repsCompleted: number;

  @IsNumber()
  @Min(0)
  weightKg: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateWorkoutLogDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  workoutDayId?: string;

  @IsOptional()
  @IsString()
  workoutPlanId?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsNumber()
  caloriesBurned?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  perceivedExertionRpe?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogExerciseSetDto)
  exercises: LogExerciseSetDto[];
}
