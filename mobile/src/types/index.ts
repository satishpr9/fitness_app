export type UserRole = 'USER' | 'ADMIN';
export type SubscriptionTier = 'FREE' | 'PREMIUM';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type FitnessGoal =
  | 'WEIGHT_LOSS'
  | 'MUSCLE_GAIN'
  | 'MAINTENANCE'
  | 'GENERAL_FITNESS'
  | 'STRENGTH'
  | 'ENDURANCE';
export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE';
export type DietaryPreference =
  | 'VEGETARIAN'
  | 'VEGAN'
  | 'EGGETARIAN'
  | 'NON_VEGETARIAN'
  | 'PESCATARIAN'
  | 'KETO'
  | 'PALEO';
export type WorkoutExperience = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type MealType =
  | 'BREAKFAST'
  | 'MORNING_SNACK'
  | 'LUNCH'
  | 'EVENING_SNACK'
  | 'DINNER'
  | 'PRE_WORKOUT'
  | 'POST_WORKOUT'
  | 'OTHER';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: UserRole;
  tier: SubscriptionTier;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  age?: number;
  gender?: Gender;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  fitnessGoal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  dietaryPreference?: DietaryPreference;
  workoutExperience?: WorkoutExperience;
  workoutDaysPerWeek?: number;
  workoutDurationMinutes?: number;
  availableEquipment?: string[];
  allergies?: string[];
  foodDislikes?: string[];
  preferredCuisines?: string[];
  mealsPerDay?: number;
  sleepDurationHours?: number;
  dailyWaterTargetMl?: number;
  isOnboardingCompleted: boolean;
  onboardingStep: number;
}

export interface NutritionTarget {
  id: string;
  userId: string;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  fiberTargetG?: number;
  isCustomOverride: boolean;
  notes?: string;
}

export interface NutritionCalculationResult {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  fiberTargetG: number;
  macroPercentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
  waterTargetMl: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cuisine?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlobal: boolean;
  userId?: string;
}

export interface FoodLog {
  id: string;
  userId: string;
  foodItemId?: string;
  foodItem?: FoodItem;
  customFoodName?: string;
  mealType: MealType;
  quantity: number;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  date: string;
}

export interface DailyFoodDiary {
  date: string;
  summary: {
    calories: { consumed: number; target: number; remaining: number };
    protein: { consumed: number; target: number; remaining: number };
    carbs: { consumed: number; target: number; remaining: number };
    fat: { consumed: number; target: number; remaining: number };
    fiber: { consumed: number; target: number; remaining: number };
  };
  meals: Record<
    string,
    {
      items: FoodLog[];
      totalCalories: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
      fiberG: number;
    }
  >;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  isGlobal: boolean;
}

export interface WorkoutDayExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  orderInDay: number;
  sets: number;
  reps: number;
  targetWeightKg?: number;
  durationSeconds?: number;
  restTimeSeconds: number;
  tempo?: string;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  dayNumber: number;
  dayName: string;
  isRestDay: boolean;
  targetDurationMinutes: number;
  notes?: string;
  exercises: WorkoutDayExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  durationWeeks: number;
  difficulty: string;
  goal?: string;
  status: PlanStatus;
  days: WorkoutDay[];
  createdAt: string;
}

export interface WorkoutLogExercise {
  id: string;
  exerciseId: string;
  exercise?: Exercise;
  setNumber: number;
  repsCompleted: number;
  weightKg?: number;
  durationSeconds?: number;
  rpeRating?: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  workoutPlanId?: string;
  sessionName: string;
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  totalVolumeKg?: number;
  rpeOverall?: number;
  notes?: string;
  exercises: WorkoutLogExercise[];
}

export interface WaterLog {
  id: string;
  userId: string;
  amountMl: number;
  date: string;
  timeLogged: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  weightKg: number;
  date: string;
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  bicepsCm?: number;
  thighsCm?: number;
  bodyFatPercentage?: number;
}

export interface DashboardData {
  greeting: string;
  userName: string;
  avatarUrl?: string;
  tier: SubscriptionTier;
  weight: {
    current: number;
    target: number;
  };
  calories: {
    consumed: number;
    target: number;
    remaining: number;
  };
  macros: {
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fat: { consumed: number; target: number };
  };
  todayMeals: {
    breakfastLogged: boolean;
    lunchLogged: boolean;
    snackLogged: boolean;
    dinnerLogged: boolean;
  };
  todayWorkout: {
    isCompleted: boolean;
    planTitle?: string;
    todaySessionName: string;
    isRestDay: boolean;
    exercisesCount: number;
  };
  water: {
    consumedMl: number;
    targetMl: number;
    glassesConsumed: number;
    targetGlasses: number;
  };
  streak: {
    workoutsThisWeek: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: any;
  timestamp: string;
}
