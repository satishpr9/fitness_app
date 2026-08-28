import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { LogWaterDto, QuickAddWaterDto } from './dto/progress.dto';

@Injectable()
export class WaterService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log water intake
   */
  async logWater(tenantId: string, userId: string, dto: LogWaterDto) {
    return this.prisma.waterLog.create({
      data: {
        tenantId,
        userId,
        date: new Date(dto.date),
        amountMl: dto.amountMl,
      },
    });
  }

  /**
   * Quick Add water (e.g. +250ml, +500ml, +750ml for today)
   */
  async quickAdd(tenantId: string, userId: string, dto: QuickAddWaterDto) {
    const today = new Date().toISOString().split('T')[0];
    return this.logWater(tenantId, userId, {
      date: today,
      amountMl: dto.amountMl,
    });
  }

  /**
   * Get daily water intake and goal progress
   */
  async getDailyWater(tenantId: string, userId: string, dateStr: string) {
    const date = new Date(dateStr);

    const [logs, profile, tenantSettings] = await Promise.all([
      this.prisma.waterLog.findMany({
        where: { tenantId, userId, date },
        orderBy: { loggedAt: 'asc' },
      }),
      this.prisma.customerProfile.findUnique({
        where: { userId },
        select: { dailyWaterTargetMl: true },
      }),
      this.prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: { waterDefaultTargetMl: true },
      }),
    ]);

    const totalConsumedMl = logs.reduce((acc, log) => acc + log.amountMl, 0);
    const targetMl =
      profile?.dailyWaterTargetMl ||
      tenantSettings?.waterDefaultTargetMl ||
      2500;

    const glassesConsumed = Number((totalConsumedMl / 250).toFixed(1));
    const targetGlasses = Math.ceil(targetMl / 250);

    return {
      date: dateStr,
      targetMl,
      totalConsumedMl,
      remainingMl: Math.max(0, targetMl - totalConsumedMl),
      percentageCompleted: Math.min(100, Math.round((totalConsumedMl / targetMl) * 100)),
      glassesConsumed,
      targetGlasses,
      logs,
    };
  }

  /**
   * Get weekly water history
   */
  async getWeeklyWater(tenantId: string, userId: string, startDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const logs = await this.prisma.waterLog.findMany({
      where: {
        tenantId,
        userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    const dayMap = new Map<string, number>();
    for (const log of logs) {
      const d = log.date.toISOString().split('T')[0];
      dayMap.set(d, (dayMap.get(d) || 0) + log.amountMl);
    }

    return Array.from(dayMap.entries()).map(([date, totalMl]) => ({
      date,
      totalMl,
    }));
  }
}
