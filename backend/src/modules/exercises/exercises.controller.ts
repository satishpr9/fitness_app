import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, ExerciseSearchQueryDto } from './dto/exercise.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  /**
   * Search exercises library
   */
  @Get('search')
  search(
    @CurrentTenant() tenantId: string,
    @Query() queryDto: ExerciseSearchQueryDto,
  ) {
    return this.exercisesService.searchExercises(tenantId, queryDto);
  }

  /**
   * Create custom exercise (Trainer / Tenant Admin)
   */
  @Post('custom')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.TRAINER)
  createCustom(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.exercisesService.createExercise(dto, tenantId, false);
  }

  /**
   * Create global exercise (Super Admin only)
   */
  @Post('global')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  createGlobal(@Body() dto: CreateExerciseDto) {
    return this.exercisesService.createExercise(dto, null, true);
  }

  /**
   * Get exercise by ID
   */
  @Get(':id')
  findOne(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.exercisesService.findOne(id, tenantId);
  }
}
