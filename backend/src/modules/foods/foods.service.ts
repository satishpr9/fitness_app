import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateFoodItemDto, FoodSearchQueryDto } from './dto/food.dto';

@Injectable()
export class FoodsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Search foods across global database and user's private custom foods
   */
  async searchFoods(userId?: string, queryDto: FoodSearchQueryDto = {}) {
    const {
      query,
      category,
      cuisine,
      isVegetarian,
      isVegan,
      limit = 50,
      offset = 0,
    } = queryDto;

    const where: any = {
      OR: [{ isGlobal: true }, ...(userId ? [{ userId }] : [])],
    };

    if (query) {
      where.name = {
        contains: query,
        mode: 'insensitive',
      };
    }

    if (category) {
      where.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    if (cuisine) {
      where.cuisine = {
        equals: cuisine,
        mode: 'insensitive',
      };
    }

    if (isVegetarian !== undefined) {
      where.isVegetarian = isVegetarian;
    }

    if (isVegan !== undefined) {
      where.isVegan = isVegan;
    }

    const [items, total] = await Promise.all([
      this.prisma.foodItem.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ isGlobal: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.foodItem.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  /**
   * Find food item by ID
   */
  async findOne(id: string, userId?: string) {
    const food = await this.prisma.foodItem.findFirst({
      where: {
        id,
        OR: [{ isGlobal: true }, ...(userId ? [{ userId }] : [])],
      },
    });

    if (!food) {
      throw new NotFoundException(`Food item with ID ${id} not found`);
    }

    return food;
  }

  /**
   * Create custom food item (User custom or Global if admin)
   */
  async createFood(dto: CreateFoodItemDto, userId?: string, isGlobal = false) {
    return this.prisma.foodItem.create({
      data: {
        name: dto.name,
        category: dto.category || 'Other',
        servingSize: dto.servingSize || 100,
        servingUnit: dto.servingUnit || 'g',
        calories: dto.calories,
        protein: dto.protein,
        carbs: dto.carbs,
        fat: dto.fat,
        fiber: dto.fiber || 0,
        sugar: dto.sugar || 0,
        sodium: dto.sodium || 0,
        cuisine: dto.cuisine || 'Indian',
        isVegetarian: dto.isVegetarian ?? true,
        isVegan: dto.isVegan ?? false,
        isGlobal: isGlobal || !userId,
        userId: isGlobal ? null : userId,
      },
    });
  }

  /**
   * Portion nutrition scaling
   */
  calculatePortionNutrition(food: any, quantity: number, targetServingSize?: number) {
    const baseServing = food.servingSize || 100;
    const effectiveGrams = (targetServingSize || baseServing) * quantity;
    const ratio = effectiveGrams / baseServing;

    return {
      quantity,
      servingSize: targetServingSize || baseServing,
      servingUnit: food.servingUnit,
      calories: Number((food.calories * ratio).toFixed(1)),
      proteinG: Number((food.protein * ratio).toFixed(1)),
      carbsG: Number((food.carbs * ratio).toFixed(1)),
      fatG: Number((food.fat * ratio).toFixed(1)),
      fiberG: Number((food.fiber * ratio).toFixed(1)),
    };
  }

  async getCategories() {
    const categories = await this.prisma.foodItem.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map((c) => c.category).filter(Boolean);
  }

  async getCuisines() {
    const cuisines = await this.prisma.foodItem.findMany({
      select: { cuisine: true },
      distinct: ['cuisine'],
    });
    return cuisines.map((c) => c.cuisine).filter(Boolean);
  }
}
