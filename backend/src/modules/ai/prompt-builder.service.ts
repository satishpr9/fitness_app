import { Injectable } from '@nestjs/common';
import { CustomerProfile, NutritionTarget } from '@prisma/client';

@Injectable()
export class PromptBuilderService {
  /**
   * Build prompt for structured AI Diet Plan generation
   */
  buildDietPlanPrompt(
    profile: CustomerProfile,
    targets: NutritionTarget,
    durationDays: number,
    specialInstructions?: string,
  ): string {
    return `
You are an expert sports nutritionist and diet planner.
Generate a strictly structured ${durationDays}-day diet plan for the following client profile:

CLIENT TARGETS (MANDATORY DETERMINISTIC CONSTRAINTS):
- Daily Target Calories: ${targets.dailyCalorieTarget} kcal (allowed variation: ±5%)
- Target Protein: ${targets.proteinTargetG}g
- Target Carbohydrates: ${targets.carbsTargetG}g
- Target Fat: ${targets.fatTargetG}g
- Target Fiber: ${targets.fiberTargetG}g

CLIENT PREFERENCES & CONSTRAINTS:
- Fitness Goal: ${profile.fitnessGoal}
- Dietary Preference: ${profile.dietaryPreference} (CRITICAL: Strictly respect veg/non-veg/vegan)
- Allergies: ${profile.allergies?.length ? profile.allergies.join(', ') : 'None'} (CRITICAL: Do NOT include any of these ingredients)
- Food Dislikes: ${profile.foodDislikes?.length ? profile.foodDislikes.join(', ') : 'None'}
- Preferred Cuisines: ${profile.preferredCuisines?.join(', ') || 'Indian'}
- Meals Per Day: ${profile.mealsPerDay || 4}
- Daily Food Budget: ${profile.dailyFoodBudget ? `$${profile.dailyFoodBudget}` : 'Flexible'}
${specialInstructions ? `- Special User Notes: ${specialInstructions}` : ''}

OUTPUT FORMAT:
Respond ONLY with valid JSON matching this exact schema:
{
  "name": "Personalized ${durationDays}-Day Nutrition Plan",
  "description": "Tailored plan for ${profile.fitnessGoal}",
  "days": [
    {
      "dayNumber": 1,
      "notes": "Focus on hydration and whole foods",
      "meals": [
        {
          "mealType": "BREAKFAST",
          "name": "Power Oats with Whey & Nuts",
          "timeSuggestion": "08:00 AM",
          "mealOrder": 1,
          "items": [
            {
              "customFoodName": "Rolled Oats",
              "quantity": 1,
              "servingSize": 60,
              "servingUnit": "g",
              "calories": 220,
              "proteinG": 8,
              "carbsG": 38,
              "fatG": 4,
              "fiberG": 6
            }
          ]
        }
      ]
    }
  ]
}
`.trim();
  }

  /**
   * Build prompt for structured AI Workout Plan generation
   */
  buildWorkoutPlanPrompt(
    profile: CustomerProfile,
    durationWeeks: number,
    specialInstructions?: string,
  ): string {
    return `
You are an elite strength and conditioning coach.
Generate a structured ${durationWeeks}-week workout split for the following client:

CLIENT CONSTRAINTS:
- Fitness Goal: ${profile.fitnessGoal}
- Experience Level: ${profile.workoutExperience || 'BEGINNER'}
- Available Training Days Per Week: ${profile.workoutDaysPerWeek || 4} days
- Target Session Duration: ${profile.workoutDurationMinutes || 45} minutes
- Available Equipment: ${profile.availableEquipment?.join(', ') || 'Dumbbells, Bodyweight'}
${specialInstructions ? `- User Notes: ${specialInstructions}` : ''}

OUTPUT FORMAT:
Respond ONLY with valid JSON matching this exact schema:
{
  "name": "${profile.fitnessGoal} Progression Split",
  "description": "Structured ${profile.workoutDaysPerWeek}-day split for ${profile.workoutExperience} level",
  "durationWeeks": ${durationWeeks},
  "difficulty": "${profile.workoutExperience || 'BEGINNER'}",
  "goal": "${profile.fitnessGoal}",
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Upper Body Push & Core",
      "isRestDay": false,
      "targetDurationMinutes": ${profile.workoutDurationMinutes || 45},
      "notes": "Warm up with dynamic shoulder mobility for 5 mins",
      "exercises": [
        {
          "exerciseName": "Dumbbell Bench Press",
          "orderInDay": 1,
          "sets": 3,
          "reps": 10,
          "targetWeightKg": 15,
          "restTimeSeconds": 60,
          "tempo": "2-0-2-0",
          "notes": "Keep shoulders retracted"
        }
      ]
    }
  ]
}
`.trim();
  }

  /**
   * Build system & user prompt for AI Coach Conversation
   */
  buildCoachPrompt(
    profile: CustomerProfile,
    nutritionTarget?: NutritionTarget,
    todayFoodSummary?: any,
    activeWorkoutSession?: string,
  ): string {
    return `
You are 'Aero', an empathetic, scientifically grounded AI fitness and nutrition coach.
You have real-time access to the user's isolated profile and live data:

USER PROFILE:
- Name: ${profile.userId}
- Fitness Goal: ${profile.fitnessGoal}
- Dietary Preference: ${profile.dietaryPreference}
- Allergies: ${profile.allergies?.join(', ') || 'None'}

TODAY'S LIVE DATA:
- Calorie Target: ${nutritionTarget?.dailyCalorieTarget || 2000} kcal
- Calories Consumed Today: ${todayFoodSummary?.calories?.consumed || 0} kcal
- Calories Remaining Today: ${todayFoodSummary?.calories?.remaining || 0} kcal
- Protein Remaining: ${todayFoodSummary?.protein?.remaining || 0}g
- Today's Workout: ${activeWorkoutSession || 'Rest Day'}

INSTRUCTIONS:
1. Provide actionable, concise, motivating advice.
2. When suggesting meals, prioritize their remaining calories and dietary preferences.
3. If they missed a workout, offer schedule rebalancing rather than panic workouts.
4. Keep answers under 3 paragraphs with bullet points for readability.
`.trim();
  }
}
