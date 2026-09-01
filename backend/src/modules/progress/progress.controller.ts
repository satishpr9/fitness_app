import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { LogBodyMeasurementDto, LogWeightDto } from './dto/progress.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('weight')
  logWeight(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogWeightDto,
  ) {
    return this.progressService.logWeight(user.userId, dto);
  }

  @Get('weight')
  getWeightHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('days') days = '60',
  ) {
    return this.progressService.getWeightHistory(user.userId, parseInt(days, 10));
  }

  @Post('measurements')
  logBodyMeasurements(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogBodyMeasurementDto,
  ) {
    return this.progressService.logBodyMeasurements(user.userId, dto);
  }

  @Get('measurements')
  getMeasurements(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit = '20',
  ) {
    return this.progressService.getBodyMeasurementsHistory(
      user.userId,
      parseInt(limit, 10),
    );
  }

  @Post('photos/upload-url')
  getPhotoUploadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Body('fileName') fileName: string,
  ) {
    return this.progressService.getPhotoUploadUrl(
      user.userId,
      fileName || 'photo.jpg',
    );
  }

  @Post('photos')
  savePhoto(
    @CurrentUser() user: AuthenticatedUser,
    @Body('photoUrl') photoUrl: string,
    @Body('pose') pose?: string,
    @Body('notes') notes?: string,
  ) {
    return this.progressService.saveProgressPhoto(
      user.userId,
      photoUrl,
      pose,
      notes,
    );
  }

  @Get('photos')
  getPhotos(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getProgressPhotos(user.userId);
  }
}
