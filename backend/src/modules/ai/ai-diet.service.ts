import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { PromptBuilderService } from './prompt-builder.service';
import { LlmService } from './llm.service';
import { AiValidationService } from './ai-validation.service';
import { GenerateAiDietDto } from './dto/ai-requests.dto';
import { PlanStatus } from '@prisma/client';

@Injectable()
export class AiDietService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nutritionService: NutritionService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly llmService: LlmService,
    private readonly validator: AiValidationService,
  ) {}

  /**
   * AI Diet Generation Pipeline
   */
  async generateDietPlan(
    tenantId: string,
    userId: string,
    dto: GenerateAiDietDto,
  ) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Customer profile not found');
    }

    const targets = await this.nutritionService.getUserTargets(tenantId, userId);

    // Build Prompt
    const prompt = this.promptBuilder.buildDietPlanPrompt(
      profile,
      targets,
      dto.durationDays || 7,
      dto.specialInstructions,
    );

    const systemPrompt =
      'You are a professional clinical & sports nutritionist. Always output valid structured JSON conforming to the requested schema.';

    // Call LLM
    const aiResponse = await this.llmService.generateJsonCompletion(systemPrompt, prompt);

    // Validate Response
    this.validator.validateDietPlan(aiResponse, profile, targets);

    // Persist as DRAFT DietPlan
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.dietPlan.create({
        data: {
          tenantId,
          customerId: userId,
          createdById: userId,
          name: aiResponse.name || `AI ${dto.durationDays}-Day Diet Plan`,
          description: aiResponse.description || 'AI-generated personalized nutrition plan',
          durationDays: dto.durationDays || 7,
          targetCalories: targets.dailyCalorieTarget,
          targetProteinG: targets.proteinTargetG,
          targetCarbsG: targets.carbsTargetG,
          targetFatG: targets.fatTargetG,
          status: PlanStatus.DRAFT,
          isAiGenerated: true,
          aiModel: 'gpt-4o-mini',
        },
      });

      for (const day of aiResponse.days) {
        let dayCal = 0,
          dayP = 0,
          dayC = 0,
          dayF = 0,
          dayFib = 0;

        for (const m of day.meals) {
          for (const item of m.items) {
            dayCal += item.calories || 0;
            dayP += item.proteinG || 0;
            dayC += item.carbsG || 0;
            dayF += item.fatG || 0;
            dayFib += item.fiberG || 0;
          }
        }

        const planDay = await tx.dietPlanDay.create({
          data: {
            dietPlanId: plan.id,
            dayNumber: day.dayNumber,
            notes: day.notes,
            totalCalories: dayCal,
            totalProteinG: dayP,
            totalCarbsG: dayC,
            totalFatG: dayF,
            totalFiberG: dayFib,
          },
        });

        for (const m of day.meals) {
          let mealCal = 0,
            mealP = 0,
            mealC = 0,
            mealF = 0,
            mealFib = 0;

          for (const item of m.items) {
            mealCal += item.calories || 0;
            mealP += item.proteinG || 0;
            mealC += item.carbsG || 0;
            mealF += item.fatG || 0;
            mealFib += item.fiberG || 0;
          }

          const meal = await tx.dietMeal.create({
            data: {
              dietPlanDayId: planDay.id,
              mealType: m.mealType || 'BREAKFAST',
              name: m.name,
              timeSuggestion: m.timeSuggestion,
              mealOrder: m.mealOrder || 1,
              totalCalories: mealCal,
              totalProteinG: mealP,
              totalCarbsG: mealC,
              totalFatG: mealF,
              totalFiberG: mealFib,
            },
          });

          for (const item of m.items) {
            await tx.dietMealItem.create({
              data: {
                dietMealId: meal.id,
                customFoodName: item.customFoodName || item.name,
                quantity: item.quantity || 1,
                servingSize: item.servingSize || 100,
                servingUnit: item.servingUnit || 'g',
                calories: item.calories,
                proteinG: item.proteinG,
                carbsG: item.carbsG,
                fatG: item.fatG,
                fiberG: item.fiberG || 0,
                notes: item.notes,
              },
            });
          }
        }
      }

      return tx.dietPlan.findUnique({
        where: { id: plan.id },
        include: {
          days: {
            include: {
              meals: {
                include: { items: true },
              },
            },
          },
        },
      });
    });
  }
}
