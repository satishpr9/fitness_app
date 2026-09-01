import { FoodsService } from './foods.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('FoodsService', () => {
  let service: FoodsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      foodItem: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    service = new FoodsService(mockPrisma as PrismaService);
  });

  describe('Portion Nutrition Scaling Math', () => {
    it('should scale nutrition proportionally for double portion (200g from 100g base)', () => {
      const baseFood = {
        servingSize: 100,
        servingUnit: 'g',
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fat: 0.3,
        fiber: 0.4,
      };

      const result = service.calculatePortionNutrition(baseFood, 2, 100);
      expect(result.calories).toBe(260);
      expect(result.proteinG).toBe(5.4);
      expect(result.carbsG).toBe(56);
      expect(result.fatG).toBe(0.6);
      expect(result.fiberG).toBe(0.8);
    });

    it('should scale nutrition when custom serving size is specified (150g from 100g base)', () => {
      const baseFood = {
        servingSize: 100,
        servingUnit: 'g',
        calories: 160,
        protein: 9,
        carbs: 22,
        fat: 4,
        fiber: 4,
      };

      const result = service.calculatePortionNutrition(baseFood, 1, 150);
      expect(result.calories).toBe(240);
      expect(result.proteinG).toBe(13.5);
      expect(result.carbsG).toBe(33);
      expect(result.fatG).toBe(6);
      expect(result.fiberG).toBe(6);
    });
  });

  describe('Food Search User Scoping', () => {
    it('should query global foods and user custom foods', async () => {
      mockPrisma.foodItem.findMany.mockResolvedValue([]);
      mockPrisma.foodItem.count.mockResolvedValue(0);

      const userId = '11111111-1111-1111-1111-111111111111';
      await service.searchFoods(userId, { query: 'Roti', isVegetarian: true });

      expect(mockPrisma.foodItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [{ isGlobal: true }, { userId }],
            name: { contains: 'Roti', mode: 'insensitive' },
            isVegetarian: true,
          }),
        }),
      );
    });
  });
});
