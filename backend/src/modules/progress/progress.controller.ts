import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { LogBodyMeasurementDto, LogWeightDto } from './dto/progress.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('progress')
@UseGuards(TenantGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  /**
   * Log daily weight
   */
  @Post('weight')
  logWeight(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogWeightDto,
  ) {
    return this.progressService.logWeight(tenantId, user.userId, dto);
  }

  /**
   * Get weight trend and history
   */
  @Get('weight')
  getWeightHistory(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('days') days = '60',
  ) {
    return this.progressService.getWeightHistory(
      tenantId,
      user.userId,
      parseInt(days, 10),
    );
  }

  /**
   * Log body measurements
   */
  @Post('measurements')
  logBodyMeasurements(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogBodyMeasurementDto,
  ) {
    return this.progressService.logBodyMeasurements(tenantId, user.userId, dto);
  }

  /**
   * Get body measurements history
   */
  @Get('measurements')
  getMeasurements(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit = '20',
  ) {
    return this.progressService.getBodyMeasurementsHistory(
      tenantId,
      user.userId,
      parseInt(limit, 10),
    );
  }

  /**
   * Request signed upload URL for progress photo
   */
  @Post('photos/upload-url')
  getPhotoUploadUrl(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('fileName') fileName: string,
  ) {
    return this.progressService.getPhotoUploadUrl(
      tenantId,
      user.userId,
      fileName || 'photo.jpg',
    );
  }

  /**
   * Save uploaded photo record
   */
  @Post('photos')
  savePhoto(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('photoUrl') photoUrl: string,
    @Body('pose') pose?: string,
    @Body('notes') notes?: string,
  ) {
    return this.progressService.saveProgressPhoto(
      tenantId,
      user.userId,
      photoUrl,
      pose,
      notes,
    );
  }

  /**
   * Get progress photos
   */
  @Get('photos')
  getPhotos(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.progressService.getProgressPhotos(tenantId, user.userId);
  }
}
