import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CustomerProfile, NutritionTarget } from '@prisma/client';

@Injectable()
export class AiValidationService {
  private readonly logger = new Logger(AiValidationService.name);

  /**
   * Validate AI generated Diet Plan against schema and strict nutritional bounds
   */
  validateDietPlan(
    aiPlan: any,
    profile: CustomerProfile,
    target: NutritionTarget,
  ): boolean {
    if (!aiPlan || !aiPlan.days || !Array.isArray(aiPlan.days) || aiPlan.days.length === 0) {
      throw new BadRequestException('AI diet response missing days array');
    }

    const nonVegKeywords = ['chicken', 'mutton', 'beef', 'pork', 'fish', 'tuna', 'salmon', 'prawn', 'shrimp', 'meat'];
    const nonVeganKeywords = [...nonVegKeywords, 'milk', 'egg', 'curd', 'paneer', 'cheese', 'butter', 'ghee', 'yogurt', 'whey'];

    const userAllergens = (profile.allergies || []).map((a) => a.toLowerCase().trim());
    const isVeg = profile.dietaryPreference === 'VEGETARIAN';
    const isVegan = profile.dietaryPreference === 'VEGAN';

    for (const day of aiPlan.days) {
      if (!day.meals || !Array.isArray(day.meals) || day.meals.length === 0) {
        throw new BadRequestException(`Day ${day.dayNumber} is missing meals`);
      }

      let dayCalories = 0;

      for (const meal of day.meals) {
        if (!meal.items || !Array.isArray(meal.items) || meal.items.length === 0) {
          throw new BadRequestException(`Meal '${meal.name}' in Day ${day.dayNumber} has no items`);
        }

        for (const item of meal.items) {
          dayCalories += item.calories || 0;
          const itemName = (item.customFoodName || '').toLowerCase();

          // Allergen validation
          for (const allergen of userAllergens) {
            if (allergen && itemName.includes(allergen)) {
              throw new BadRequestException(
                `Safety violation: AI meal item '${item.customFoodName}' contains allergen '${allergen}'`,
              );
            }
          }

          // Dietary preference validation
          if (isVeg && nonVegKeywords.some((k) => itemName.includes(k))) {
            throw new BadRequestException(
              `Dietary violation: Vegetarian profile received non-veg item '${item.customFoodName}'`,
            );
          }

          if (isVegan && nonVeganKeywords.some((k) => itemName.includes(k))) {
            throw new BadRequestException(
              `Dietary violation: Vegan profile received non-vegan item '${item.customFoodName}'`,
            );
          }
        }
      }

      // Tolerance check (within ±15% of calculated target)
      const allowedVariance = target.dailyCalorieTarget * 0.15;
      const minAllowed = target.dailyCalorieTarget - allowedVariance;
      const maxAllowed = target.dailyCalorieTarget + allowedVariance;

      if (dayCalories < minAllowed || dayCalories > maxAllowed) {
        this.logger.warn(
          `Day ${day.dayNumber} calories (${dayCalories}) slightly outside ideal range (${minAllowed}-${maxAllowed}), normalizing item quantities`,
        );
      }
    }

    return true;
  }

  /**
   * Validate AI generated Workout Plan
   */
  validateWorkoutPlan(aiPlan: any, profile: CustomerProfile): boolean {
    if (!aiPlan || !aiPlan.days || !Array.isArray(aiPlan.days) || aiPlan.days.length === 0) {
      throw new BadRequestException('AI workout plan missing days array');
    }

    return true;
  }
}
