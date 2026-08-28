import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class LogWeightDto {
  @IsDateString()
  date: string;

  @IsNumber()
  @Min(20)
  @Max(400)
  weightKg: number;

  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(70)
  bodyFatPercentage?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class LogBodyMeasurementDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(250)
  chestCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(250)
  waistCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(250)
  hipsCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(100)
  bicepsCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(150)
  thighsCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(100)
  calvesCm?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class LogWaterDto {
  @IsDateString()
  date: string;

  @IsNumber()
  @Min(50)
  @Max(5000)
  amountMl: number;
}

export class QuickAddWaterDto {
  @IsNumber()
  @Min(100)
  @Max(2000)
  amountMl: number; // e.g., 250, 500, 750
}
