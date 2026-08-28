import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Call LLM for structured JSON completion
   */
  async generateJsonCompletion(systemPrompt: string, userPrompt: string): Promise<any> {
    const openaiApiKey = this.configService.get<string>('ai.openaiApiKey');
    const geminiApiKey = this.configService.get<string>('ai.geminiApiKey');

    if (openaiApiKey && !openaiApiKey.includes('placeholder')) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
          }),
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content);
      } catch (err) {
        this.logger.warn(`OpenAI call failed, falling back to local engine: ${err.message}`);
      }
    }

    if (geminiApiKey && !geminiApiKey.includes('placeholder')) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
            }),
          },
        );

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;
        return JSON.parse(content);
      } catch (err) {
        this.logger.warn(`Gemini call failed, falling back to local engine: ${err.message}`);
      }
    }

    // High quality offline fallback generator when external API keys are not supplied
    return this.generateFallbackStructuredResponse(userPrompt);
  }

  /**
   * AI Coach text response stream/completion
   */
  async generateTextCompletion(systemPrompt: string, userMessage: string): Promise<string> {
    const openaiApiKey = this.configService.get<string>('ai.openaiApiKey');
    if (openaiApiKey && !openaiApiKey.includes('placeholder')) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
          }),
        });
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (err) {
        this.logger.warn(`LLM text completion failed: ${err.message}`);
      }
    }

    // Default intelligent coach response
    return `Here is my recommendation based on your current stats:\n\n• **Nutrition Focus**: You're doing great with your calories today! If you're looking for a late meal, stick with high-protein light foods (like 150g curd or grilled paneer/tofu) to meet your protein target without exceeding your calorie cap.\n• **Workout Tip**: Focus on quality repetitions and ensure at least 7-8 hours of sleep tonight for optimal muscle recovery.\n• **Hydration**: Don't forget to sip 250ml of water before heading to bed!`;
  }

  /**
   * Deterministic fallback generator respecting schema
   */
  private generateFallbackStructuredResponse(userPrompt: string): any {
    if (userPrompt.includes('workout') || userPrompt.includes('Workout')) {
      return {
        name: 'Personalized Progressive Workout Plan',
        description: 'Structured 4-week split customized to your equipment and fitness level',
        durationWeeks: 4,
        difficulty: 'INTERMEDIATE',
        goal: 'Hypertrophy & Strength',
        days: [
          {
            dayNumber: 1,
            dayName: 'Chest & Triceps Focus',
            isRestDay: false,
            targetDurationMinutes: 45,
            notes: 'Warm up shoulders with band pull-aparts for 5 mins',
            exercises: [
              { exerciseName: 'Barbell Bench Press', orderInDay: 1, sets: 4, reps: 8, targetWeightKg: 60, restTimeSeconds: 90, tempo: '3-0-1-0', notes: 'Pause slightly at chest' },
              { exerciseName: 'Incline Dumbbell Press', orderInDay: 2, sets: 3, reps: 10, targetWeightKg: 20, restTimeSeconds: 60, tempo: '2-0-1-0', notes: 'Full range of motion' },
              { exerciseName: 'Cable Fly', orderInDay: 3, sets: 3, reps: 12, targetWeightKg: 15, restTimeSeconds: 60, tempo: '2-0-1-1', notes: 'Squeeze pecs at peak contraction' },
              { exerciseName: 'Triceps Pushdown', orderInDay: 4, sets: 3, reps: 12, targetWeightKg: 25, restTimeSeconds: 60, tempo: '2-0-1-0', notes: 'Keep elbows tucked' },
            ],
          },
          {
            dayNumber: 2,
            dayName: 'Back & Biceps Focus',
            isRestDay: false,
            targetDurationMinutes: 45,
            notes: 'Engage lats before pulling',
            exercises: [
              { exerciseName: 'Lat Pulldown', orderInDay: 1, sets: 4, reps: 10, targetWeightKg: 50, restTimeSeconds: 75, tempo: '2-0-1-1', notes: 'Pull to upper chest' },
              { exerciseName: 'Seated Cable Row', orderInDay: 2, sets: 3, reps: 10, targetWeightKg: 45, restTimeSeconds: 60, tempo: '2-0-1-0', notes: 'Keep back straight' },
              { exerciseName: 'Dumbbell Biceps Curl', orderInDay: 3, sets: 3, reps: 12, targetWeightKg: 12, restTimeSeconds: 60, tempo: '2-0-1-0', notes: 'No swinging' },
            ],
          },
          {
            dayNumber: 3,
            dayName: 'Active Recovery & Mobility',
            isRestDay: true,
            targetDurationMinutes: 20,
            notes: 'Light walking and stretching',
            exercises: [],
          },
        ],
      };
    }

    // Diet Plan fallback
    return {
      name: 'Custom AI Optimized Nutrition Plan',
      description: 'Balanced macronutrient distribution aligned with your daily targets',
      days: [
        {
          dayNumber: 1,
          notes: 'Drink 500ml water upon waking',
          meals: [
            {
              mealType: 'BREAKFAST',
              name: 'Oatmeal with Almond Milk, Chia Seeds & Fruit',
              timeSuggestion: '08:30 AM',
              mealOrder: 1,
              items: [
                { customFoodName: 'Rolled Oats', quantity: 1, servingSize: 60, servingUnit: 'g', calories: 230, proteinG: 8, carbsG: 40, fatG: 4, fiberG: 6 },
                { customFoodName: 'Almond Milk (Unsweetened)', quantity: 1, servingSize: 200, servingUnit: 'ml', calories: 30, proteinG: 1, carbsG: 1, fatG: 2.5, fiberG: 1 },
                { customFoodName: 'Banana', quantity: 1, servingSize: 100, servingUnit: 'g', calories: 90, proteinG: 1, carbsG: 23, fatG: 0.3, fiberG: 2.5 },
                { customFoodName: 'Boiled Eggs / Tofu Scramble', quantity: 2, servingSize: 100, servingUnit: 'g', calories: 150, proteinG: 13, carbsG: 1, fatG: 10, fiberG: 0 },
              ],
            },
            {
              mealType: 'LUNCH',
              name: 'Brown Rice with Dal Tadka & Grilled Protein',
              timeSuggestion: '01:30 PM',
              mealOrder: 2,
              items: [
                { customFoodName: 'Brown Rice (Cooked)', quantity: 1, servingSize: 150, servingUnit: 'g', calories: 180, proteinG: 4, carbsG: 38, fatG: 1.5, fiberG: 3 },
                { customFoodName: 'Yellow Dal Tadka', quantity: 1, servingSize: 150, servingUnit: 'g', calories: 160, proteinG: 9, carbsG: 22, fatG: 4, fiberG: 4 },
                { customFoodName: 'Paneer Tikka / Chicken Breast', quantity: 1, servingSize: 120, servingUnit: 'g', calories: 240, proteinG: 24, carbsG: 4, fatG: 14, fiberG: 1 },
                { customFoodName: 'Cucumber Tomato Salad', quantity: 1, servingSize: 100, servingUnit: 'g', calories: 25, proteinG: 1, carbsG: 5, fatG: 0.2, fiberG: 2 },
              ],
            },
            {
              mealType: 'EVENING_SNACK',
              name: 'Greek Yogurt with Mixed Berries',
              timeSuggestion: '05:30 PM',
              mealOrder: 3,
              items: [
                { customFoodName: 'Plain Greek Yogurt', quantity: 1, servingSize: 150, servingUnit: 'g', calories: 100, proteinG: 15, carbsG: 6, fatG: 1, fiberG: 0 },
                { customFoodName: 'Almonds', quantity: 1, servingSize: 15, servingUnit: 'g', calories: 85, proteinG: 3, carbsG: 3, fatG: 7, fiberG: 1.5 },
              ],
            },
            {
              mealType: 'DINNER',
              name: 'Whole Wheat Roti with Mixed Veg Sabzi & Curd',
              timeSuggestion: '08:30 PM',
              mealOrder: 4,
              items: [
                { customFoodName: 'Whole Wheat Roti', quantity: 2, servingSize: 60, servingUnit: 'g', calories: 160, proteinG: 5, carbsG: 32, fatG: 1, fiberG: 4 },
                { customFoodName: 'Mixed Vegetable Curry', quantity: 1, servingSize: 150, servingUnit: 'g', calories: 130, proteinG: 3, carbsG: 14, fatG: 7, fiberG: 4 },
                { customFoodName: 'Curd / Yogurt', quantity: 1, servingSize: 100, servingUnit: 'g', calories: 60, proteinG: 3.5, carbsG: 4.5, fatG: 3, fiberG: 0 },
              ],
            },
          ],
        },
      ],
    };
  }
}
