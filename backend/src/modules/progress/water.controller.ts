import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WaterService } from './water.service';
import { LogWaterDto, QuickAddWaterDto } from './dto/progress.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('water')
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  @Post('log')
  logWater(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogWaterDto,
  ) {
    return this.waterService.logWater(user.userId, dto);
  }

  @Post('quick-add')
  quickAdd(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: QuickAddWaterDto,
  ) {
    return this.waterService.quickAdd(user.userId, dto);
  }

  @Get('daily')
  getDaily(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.waterService.getDailyWater(user.userId, targetDate);
  }

  @Get('weekly')
  getWeekly(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate?: string,
  ) {
    const targetDate = startDate || new Date().toISOString().split('T')[0];
    return this.waterService.getWeeklyWater(user.userId, targetDate);
  }
}
