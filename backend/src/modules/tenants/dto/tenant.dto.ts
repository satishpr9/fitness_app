import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { TenantStatus, TenantType } from '@prisma/client';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must only contain lowercase alphanumeric characters and hyphens',
  })
  slug: string;

  @IsOptional()
  @IsEnum(TenantType)
  type?: TenantType = TenantType.GYM;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string = '#10B981';

  @IsOptional()
  @IsNumber()
  waterDefaultTargetMl?: number = 2500;
}

export class UpdateTenantSettingsDto {
  @IsOptional()
  @IsNumber()
  allowedAiPlansPerMonth?: number;

  @IsOptional()
  @IsBoolean()
  requireTrainerApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  requireNutritionistApproval?: boolean;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsNumber()
  waterDefaultTargetMl?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedCuisines?: string[];
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(TenantType)
  type?: TenantType;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
