import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CompleteOnboardingDto,
  Step1PersonalInfo,
  Step2FitnessGoals,
  Step3DietaryPreferences,
  Step4Lifestyle,
} from './dto/onboarding.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('status')
  async getStatus(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.customersService.getProfile(user.userId);
    return {
      isOnboardingCompleted: profile.isOnboardingCompleted,
      onboardingStep: profile.onboardingStep,
      profile,
    };
  }

  @Put('step/personal-info')
  updatePersonalInfo(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Step1PersonalInfo,
  ) {
    return this.customersService.updatePersonalInfo(user.userId, dto);
  }

  @Put('step/fitness-goals')
  updateFitnessGoals(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Step2FitnessGoals,
  ) {
    return this.customersService.updateFitnessGoals(user.userId, dto);
  }

  @Put('step/dietary-preferences')
  updateDietaryPreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Step3DietaryPreferences,
  ) {
    return this.customersService.updateDietaryPreferences(user.userId, dto);
  }

  @Put('step/lifestyle')
  updateLifestyle(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Step4Lifestyle,
  ) {
    return this.customersService.updateLifestyle(user.userId, dto);
  }

  @Post('complete')
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CompleteOnboardingDto,
  ) {
    return this.customersService.completeOnboarding(user.userId, dto);
  }
}
