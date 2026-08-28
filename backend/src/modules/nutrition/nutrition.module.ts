import { Module } from '@nestjs/common';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { NutritionCalculatorService } from './nutrition-calculator.service';

@Module({
  controllers: [NutritionController],
  providers: [NutritionService, NutritionCalculatorService],
  exports: [NutritionService, NutritionCalculatorService],
})
export class NutritionModule {}
