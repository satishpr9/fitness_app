import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiDietService } from './ai-diet.service';
import { AiWorkoutService } from './ai-workout.service';
import { AiCoachService } from './ai-coach.service';
import { PromptBuilderService } from './prompt-builder.service';
import { LlmService } from './llm.service';
import { AiValidationService } from './ai-validation.service';
import { NutritionModule } from '../nutrition/nutrition.module';
import { DietsModule } from '../diets/diets.module';

@Module({
  imports: [NutritionModule, DietsModule],
  controllers: [AiController],
  providers: [
    AiDietService,
    AiWorkoutService,
    AiCoachService,
    PromptBuilderService,
    LlmService,
    AiValidationService,
  ],
  exports: [AiDietService, AiWorkoutService, AiCoachService],
})
export class AiModule {}
