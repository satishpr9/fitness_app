import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { WaterController } from './water.controller';
import { WaterService } from './water.service';

@Module({
  controllers: [ProgressController, WaterController],
  providers: [ProgressService, WaterService],
  exports: [ProgressService, WaterService],
})
export class ProgressModule {}
