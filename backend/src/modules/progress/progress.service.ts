import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { LogBodyMeasurementDto, LogWeightDto } from './dto/progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Log daily weight
   */
  async logWeight(tenantId: string, userId: string, dto: LogWeightDto) {
    const logDate = new Date(dto.date);

    // Also update current weight on customer profile
    await this.prisma.customerProfile.updateMany({
      where: { userId },
      data: { currentWeightKg: dto.weightKg },
    });

    return this.prisma.weightLog.create({
      data: {
        tenantId,
        userId,
        date: logDate,
        weightKg: dto.weightKg,
        bodyFatPercentage: dto.bodyFatPercentage,
        notes: dto.notes,
      },
    });
  }

  /**
   * Get weight trend history (with moving averages and deltas)
   */
  async getWeightHistory(tenantId: string, userId: string, days = 60) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const logs = await this.prisma.weightLog.findMany({
      where: {
        tenantId,
        userId,
        date: { gte: fromDate },
      },
      orderBy: { date: 'asc' },
    });

    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      select: { targetWeightKg: true, currentWeightKg: true },
    });

    // Calculate start weight, current weight, delta
    const startWeight = logs.length > 0 ? logs[0].weightKg : profile?.currentWeightKg;
    const latestWeight = logs.length > 0 ? logs[logs.length - 1].weightKg : profile?.currentWeightKg;
    const targetWeight = profile?.targetWeightKg;
    const totalLostOrGained = (latestWeight && startWeight) ? Number((latestWeight - startWeight).toFixed(1)) : 0;

    return {
      targetWeight,
      startWeight,
      latestWeight,
      totalDelta: totalLostOrGained,
      history: logs,
    };
  }

  /**
   * Log body measurements
   */
  async logBodyMeasurements(
    tenantId: string,
    userId: string,
    dto: LogBodyMeasurementDto,
  ) {
    return this.prisma.bodyMeasurement.create({
      data: {
        tenantId,
        userId,
        date: new Date(dto.date),
        chestCm: dto.chestCm,
        waistCm: dto.waistCm,
        hipsCm: dto.hipsCm,
        bicepsCm: dto.bicepsCm,
        thighsCm: dto.thighsCm,
        calvesCm: dto.calvesCm,
        notes: dto.notes,
      },
    });
  }

  /**
   * Get body measurements history
   */
  async getBodyMeasurementsHistory(tenantId: string, userId: string, limit = 20) {
    return this.prisma.bodyMeasurement.findMany({
      where: { tenantId, userId },
      take: limit,
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get pre-signed upload URL for progress photos
   */
  async getPhotoUploadUrl(tenantId: string, userId: string, fileName: string) {
    const path = `${tenantId}/${userId}/${Date.now()}_${fileName}`;
    return this.supabaseService.createSignedUploadUrl('progress-photos', path);
  }

  /**
   * Save uploaded progress photo record
   */
  async saveProgressPhoto(
    tenantId: string,
    userId: string,
    photoUrl: string,
    pose = 'Front',
    notes?: string,
  ) {
    return this.prisma.progressPhoto.create({
      data: {
        tenantId,
        userId,
        photoUrl,
        pose,
        date: new Date(),
        notes,
      },
    });
  }

  /**
   * Get progress photos
   */
  async getProgressPhotos(tenantId: string, userId: string) {
    return this.prisma.progressPhoto.findMany({
      where: { tenantId, userId },
      orderBy: { date: 'desc' },
    });
  }
}
