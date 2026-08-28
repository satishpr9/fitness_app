import { NutritionCalculatorService } from './nutrition-calculator.service';
import { ActivityLevel, FitnessGoal, Gender } from '@prisma/client';

describe('NutritionCalculatorService', () => {
  let service: NutritionCalculatorService;

  beforeEach(() => {
    service = new NutritionCalculatorService();
  });

  describe('BMI Calculation', () => {
    it('should calculate correct BMI and category for normal weight', () => {
      const result = service.calculateBmi(70, 175);
      // 70 / (1.75 * 1.75) = 22.86 -> 22.9
      expect(result.bmi).toBe(22.9);
      expect(result.category).toBe('Normal weight');
    });

    it('should identify overweight category correctly', () => {
      const result = service.calculateBmi(85, 175);
      // 85 / (1.75 * 1.75) = 27.76 -> 27.8
      expect(result.bmi).toBe(27.8);
      expect(result.category).toBe('Overweight');
    });
  });

  describe('BMR Calculation (Mifflin-St Jeor)', () => {
    it('should calculate BMR for male correctly', () => {
      // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
      const bmr = service.calculateBmr(80, 180, 30, Gender.MALE);
      expect(bmr).toBe(1780);
    });

    it('should calculate BMR for female correctly', () => {
      // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345
      const bmr = service.calculateBmr(60, 165, 25, Gender.FEMALE);
      expect(bmr).toBe(1345);
    });
  });

  describe('TDEE & Calorie Targets', () => {
    it('should calculate TDEE with moderate activity', () => {
      const tdee = service.calculateTdee(1780, ActivityLevel.MODERATELY_ACTIVE);
      // 1780 * 1.55 = 2759
      expect(tdee).toBe(2759);
    });

    it('should calculate complete nutrition plan for weight loss', () => {
      const result = service.calculateNutrition({
        age: 28,
        gender: Gender.MALE,
        heightCm: 178,
        currentWeightKg: 82,
        fitnessGoal: FitnessGoal.WEIGHT_LOSS,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
        workoutDaysPerWeek: 4,
      });

      expect(result.bmi).toBeGreaterThan(20);
      expect(result.bmr).toBeGreaterThan(1500);
      expect(result.tdee).toBeGreaterThan(result.dailyCalorieTarget);
      expect(result.dailyCalorieTarget).toBe(result.tdee - 500);
      expect(result.proteinTargetG).toBeGreaterThan(100);
      expect(result.carbsTargetG).toBeGreaterThan(100);
      expect(result.fatTargetG).toBeGreaterThan(40);
      expect(result.waterTargetMl).toBeGreaterThan(2500);
    });

    it('should enforce safe calorie minimum floor', () => {
      const result = service.calculateNutrition({
        age: 60,
        gender: Gender.FEMALE,
        heightCm: 150,
        currentWeightKg: 45,
        fitnessGoal: FitnessGoal.WEIGHT_LOSS,
        activityLevel: ActivityLevel.SEDENTARY,
      });

      // Female minimum safe floor is 1200 kcal
      expect(result.dailyCalorieTarget).toBeGreaterThanOrEqual(1200);
    });
  });
});
