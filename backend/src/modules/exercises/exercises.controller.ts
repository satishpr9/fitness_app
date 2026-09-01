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
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get('search')
  search(
    @CurrentUser() user: AuthenticatedUser,
    @Query() queryDto: ExerciseSearchQueryDto,
  ) {
    return this.exercisesService.searchExercises(user?.userId, queryDto);
  }

  @Post('custom')
  createCustom(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.exercisesService.createExercise(dto, user.userId, false);
  }

  @Post('global')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createGlobal(@Body() dto: CreateExerciseDto) {
    return this.exercisesService.createExercise(dto, null, true);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.exercisesService.findOne(id, user?.userId);
  }
}
