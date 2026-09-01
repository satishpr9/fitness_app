import {
  Body,
  Controller,
  Get,
  Post,
  Put,
} from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CalculateNutritionDto, OverrideNutritionTargetDto } from './dto/nutrition-calculation.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Public()
  @Post('calculate')
  calculate(@Body() dto: CalculateNutritionDto) {
    return this.nutritionService.calculateTargets(dto);
  }

  @Get('targets')
  getMyTargets(@CurrentUser() user: AuthenticatedUser) {
    return this.nutritionService.getUserTargets(user.userId);
  }

  @Put('targets/override')
  overrideTargets(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: OverrideNutritionTargetDto,
  ) {
    return this.nutritionService.overrideUserTargets(user.userId, body);
  }
}
