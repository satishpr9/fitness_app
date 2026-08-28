import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GenerateAiDietDto {
  @IsNumber()
  @IsIn([1, 7, 14])
  durationDays: 1 | 7 | 14;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class GenerateAiWorkoutDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  durationWeeks?: number = 4;

  @IsOptional()
  @IsString()
  focusArea?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class AiCoachChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
