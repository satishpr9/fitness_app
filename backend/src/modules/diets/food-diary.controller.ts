import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FoodDiaryService } from './food-diary.service';
import { FoodRecognitionDto, LogFoodDto } from './dto/food-diary.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('diary')
@UseGuards(TenantGuard)
export class FoodDiaryController {
  constructor(private readonly foodDiaryService: FoodDiaryService) {}

  /**
   * Log food item to food diary
   */
  @Post('log')
  logFood(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogFoodDto,
  ) {
    return this.foodDiaryService.logFood(tenantId, user.userId, dto);
  }

  /**
   * Get daily food log breakdown and macro progress
   */
  @Get('daily')
  getDaily(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.foodDiaryService.getDailyLog(tenantId, user.userId, targetDate);
  }

  /**
   * Get weekly nutrition history
   */
  @Get('weekly')
  getWeekly(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate: string,
  ) {
    return this.foodDiaryService.getWeeklyHistory(
      tenantId,
      user.userId,
      startDate || new Date().toISOString().split('T')[0],
    );
  }

  /**
   * AI Food Recognition endpoint from image
   */
  @Post('recognize-food')
  recognizeFood(
    @CurrentTenant() tenantId: string,
    @Body() dto: FoodRecognitionDto,
  ) {
    return this.foodDiaryService.recognizeFood(tenantId, dto);
  }

  /**
   * Delete logged food entry
   */
  @Delete(':id')
  deleteLog(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.foodDiaryService.deleteLog(tenantId, user.userId, id);
  }
}
