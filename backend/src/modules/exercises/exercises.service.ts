import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateExerciseDto, ExerciseSearchQueryDto } from './dto/exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Search exercises (Global catalog + Tenant custom exercises)
   */
  async searchExercises(tenantId?: string, queryDto: ExerciseSearchQueryDto = {}) {
    const { query, muscleGroup, equipment, difficulty, category, limit = 50, offset = 0 } =
      queryDto;

    const where: any = {
      OR: [{ isGlobal: true }, ...(tenantId ? [{ tenantId }] : [])],
    };

    if (query) {
      where.name = {
        contains: query,
        mode: 'insensitive',
      };
    }

    if (muscleGroup) {
      where.muscleGroup = muscleGroup;
    }

    if (equipment) {
      where.equipment = equipment;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (category) {
      where.category = category;
    }

    const [items, total] = await Promise.all([
      this.prisma.exercise.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ isGlobal: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.exercise.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  /**
   * Find exercise by ID
   */
  async findOne(id: string, tenantId?: string) {
    const exercise = await this.prisma.exercise.findFirst({
      where: {
        id,
        OR: [{ isGlobal: true }, ...(tenantId ? [{ tenantId }] : [])],
      },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    return exercise;
  }

  /**
   * Create custom exercise (or global if super admin)
   */
  async createExercise(dto: CreateExerciseDto, tenantId?: string, isGlobal = false) {
    return this.prisma.exercise.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category || 'STRENGTH',
        muscleGroup: dto.muscleGroup,
        secondaryMuscles: dto.secondaryMuscles || [],
        equipment: dto.equipment || 'BARBELL',
        difficulty: dto.difficulty || 'BEGINNER',
        videoUrl: dto.videoUrl,
        instructions: dto.instructions || [],
        isGlobal: isGlobal || !tenantId,
        tenantId: isGlobal ? null : tenantId,
      },
    });
  }
}
