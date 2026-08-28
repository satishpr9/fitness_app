import { Module } from '@nestjs/common';
import { DietPlansController } from './diet-plans.controller';
import { DietPlansService } from './diet-plans.service';
import { FoodDiaryController } from './food-diary.controller';
import { FoodDiaryService } from './food-diary.service';
import { FoodsModule } from '../foods/foods.module';

@Module({
  imports: [FoodsModule],
  controllers: [DietPlansController, FoodDiaryController],
  providers: [DietPlansService, FoodDiaryService],
  exports: [DietPlansService, FoodDiaryService],
})
export class DietsModule {}
