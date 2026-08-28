import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { OnboardingController } from './onboarding.controller';
import { CustomersService } from './customers.service';
import { NutritionModule } from '../nutrition/nutrition.module';

@Module({
  imports: [NutritionModule],
  controllers: [CustomersController, OnboardingController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
