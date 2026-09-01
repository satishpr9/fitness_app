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

    it('should correctly classify BMI at 29.9 boundary as Overweight', () => {
      // Height 170cm, Weight 86.41kg -> BMI = 86.41 / (1.7 * 1.7) = 29.899 -> 29.9
      const result = service.calculateBmi(86.41, 170);
      expect(result.bmi).toBe(29.9);
      expect(result.category).toBe('Overweight');
    });

    it('should correctly handle zero workout days for hydration without false bonus', () => {
      const resultZeroWorkouts = service.calculateNutrition({
        age: 30,
        gender: Gender.MALE,
        heightCm: 175,
        currentWeightKg: 70,
        fitnessGoal: FitnessGoal.MAINTENANCE,
        activityLevel: ActivityLevel.SEDENTARY,
        workoutDaysPerWeek: 0,
      });

      // 70 * 35 = 2450ml (no 500ml bonus)
      expect(resultZeroWorkouts.waterTargetMl).toBe(2450);

      const resultWithWorkouts = service.calculateNutrition({
        age: 30,
        gender: Gender.MALE,
        heightCm: 175,
        currentWeightKg: 70,
        fitnessGoal: FitnessGoal.MAINTENANCE,
        activityLevel: ActivityLevel.SEDENTARY,
        workoutDaysPerWeek: 4,
      });

      // 70 * 35 + 500 = 2950ml
      expect(resultWithWorkouts.waterTargetMl).toBe(2950);
    });

    it('should enforce safe calorie minimum floor for males (1500 kcal)', () => {
      const result = service.calculateNutrition({
        age: 80,
        gender: Gender.MALE,
        heightCm: 150,
        currentWeightKg: 45,
        fitnessGoal: FitnessGoal.WEIGHT_LOSS,
        activityLevel: ActivityLevel.SEDENTARY,
      });

      // Male minimum safe floor is 1500 kcal
      expect(result.dailyCalorieTarget).toBe(1500);
    });

    it('should ensure macro percentages sum to 100%', () => {
      const result = service.calculateNutrition({
        age: 25,
        gender: Gender.MALE,
        heightCm: 180,
        currentWeightKg: 75,
        fitnessGoal: FitnessGoal.MUSCLE_GAIN,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      });

      const { protein, carbs, fat } = result.macroPercentages;
      expect(protein + carbs + fat).toBe(100);
    });
  });
});
