import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { FoodDiaryService } from './food-diary.service';
import { LogFoodDto } from './dto/food-diary.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('diary')
export class FoodDiaryController {
  constructor(private readonly foodDiaryService: FoodDiaryService) {}

  @Post('log')
  logFood(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogFoodDto,
  ) {
    return this.foodDiaryService.logFood(user.userId, dto);
  }

  @Get('daily')
  getDaily(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.foodDiaryService.getDailyLog(user.userId, targetDate);
  }

  @Get('weekly')
  getWeekly(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate: string,
  ) {
    return this.foodDiaryService.getWeeklyHistory(
      user.userId,
      startDate || new Date().toISOString().split('T')[0],
    );
  }

  @Delete(':id')
  deleteLog(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.foodDiaryService.deleteLog(user.userId, id);
  }
}
