import apiClient from './client';
import {
  BodyMeasurement,
  DailyFoodDiary,
  DashboardData,
  DietaryPreference,
  Exercise,
  FitnessGoal,
  FoodItem,
  FoodLog,
  Gender,
  MealType,
  NutritionCalculationResult,
  NutritionTarget,
  PlanStatus,
  Profile,
  SubscriptionTier,
  User,
  WaterLog,
  WeightLog,
  WorkoutExperience,
  WorkoutLog,
  WorkoutPlan,
} from '../types';

// ================= AUTH API =================
export const authApi = {
  signUp: (data: { email: string; password: string; fullName?: string; tier?: SubscriptionTier }) =>
    apiClient.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/signup', data),

  signIn: (data: { email: string; password: string }) =>
    apiClient.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/signin', data),

  getMe: () => apiClient.get<User>('/auth/me'),

  upgradeTier: (tier: SubscriptionTier) =>
    apiClient.put<{ message: string; tier: SubscriptionTier; accessToken: string; refreshToken: string; user?: User }>(
      '/auth/upgrade',
      { tier },
    ),
};

// ================= ONBOARDING API =================
export const onboardingApi = {
  getStatus: () =>
    apiClient.get<{ isOnboardingCompleted: boolean; onboardingStep: number; profile: Profile }>(
      '/onboarding/status',
    ),

  updatePersonalInfo: (data: {
    fullName?: string;
    age: number;
    gender: Gender;
    heightCm: number;
    currentWeightKg: number;
    targetWeightKg?: number;
  }) => apiClient.put<Profile>('/onboarding/step/personal-info', data),

  updateFitnessGoals: (data: {
    fitnessGoal: FitnessGoal;
    activityLevel: string;
    workoutExperience: WorkoutExperience;
    workoutDaysPerWeek: number;
    workoutDurationMinutes: number;
    availableEquipment: string[];
  }) => apiClient.put<Profile>('/onboarding/step/fitness-goals', data),

  updateDietaryPreferences: (data: {
    dietaryPreference: DietaryPreference;
    allergies?: string[];
    foodDislikes?: string[];
    preferredCuisines?: string[];
    mealsPerDay: number;
    dailyFoodBudget?: number;
  }) => apiClient.put<Profile>('/onboarding/step/dietary-preferences', data),

  updateLifestyle: (data: { sleepDurationHours: number; dailyWaterTargetMl: number }) =>
    apiClient.put<Profile>('/onboarding/step/lifestyle', data),

  completeOnboarding: (data: any) => apiClient.post<Profile>('/onboarding/complete', data),
};

// ================= NUTRITION API =================
export const nutritionApi = {
  calculate: (data: {
    age: number;
    gender: Gender;
    heightCm: number;
    currentWeightKg: number;
    targetWeightKg?: number;
    fitnessGoal: FitnessGoal;
    activityLevel: string;
    workoutDaysPerWeek?: number;
  }) => apiClient.post<NutritionCalculationResult>('/nutrition/calculate', data),

  getMyTargets: () => apiClient.get<NutritionTarget>('/nutrition/targets'),

  overrideTargets: (data: {
    dailyCalorieTarget?: number;
    proteinTargetG?: number;
    carbsTargetG?: number;
    fatTargetG?: number;
    fiberTargetG?: number;
    notes?: string;
  }) => apiClient.put<NutritionTarget>('/nutrition/targets/override', data),
};

// ================= FOODS API =================
export const foodsApi = {
  search: (params?: {
    query?: string;
    category?: string;
    cuisine?: string;
    isVegetarian?: boolean;
    isVegan?: boolean;
    limit?: number;
    offset?: number;
  }) => apiClient.get<FoodItem[]>('/foods/search', { params }),

  getCategories: () => apiClient.get<string[]>('/foods/categories'),

  getCuisines: () => apiClient.get<string[]>('/foods/cuisines'),

  createCustomFood: (data: {
    name: string;
    category?: string;
    servingSize: number;
    servingUnit?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    cuisine?: string;
    isVegetarian?: boolean;
    isVegan?: boolean;
  }) => apiClient.post<FoodItem>('/foods/custom', data),
};

// ================= DIETS & FOOD DIARY API =================
export const dietsApi = {
  getDailyDiary: (date?: string) =>
    apiClient.get<DailyFoodDiary>('/diary/daily', { params: { date } }),

  logFood: (data: {
    foodItemId?: string;
    foodName: string;
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
    date?: string;
  }) =>
    apiClient.post<FoodLog>('/diary/log', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
    }),

  deleteFoodLog: (id: string) => apiClient.delete(`/diary/${id}`),

  getDietPlans: () => apiClient.get<{ items: WorkoutPlan[]; total: number }>('/diets/plans'),

  getDietPlan: (id: string) => apiClient.get<any>(`/diets/plans/${id}`),
};

// ================= EXERCISES & WORKOUTS API =================
export const workoutsApi = {
  getExercises: (params?: {
    muscleGroup?: string;
    category?: string;
    equipment?: string;
    difficulty?: string;
  }) => apiClient.get<Exercise[]>('/exercises/search', { params }),

  getWorkoutPlans: (status?: PlanStatus) =>
    apiClient.get<WorkoutPlan[]>('/workouts/plans', {
      params: { status },
    }),

  getWorkoutPlan: (id: string) => apiClient.get<WorkoutPlan>(`/workouts/plans/${id}`),

  logWorkoutSession: (data: {
    workoutPlanId?: string;
    name: string;
    date?: string;
    startedAt: string;
    completedAt?: string;
    durationMinutes?: number;
    perceivedExertionRpe?: number;
    notes?: string;
    exercises: {
      exerciseId: string;
      setNumber: number;
      repsCompleted: number;
      weightKg?: number;
      durationSeconds?: number;
      rpe?: number;
      notes?: string;
    }[];
  }) =>
    apiClient.post<WorkoutLog>('/workouts/logs', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
    }),

  getRecentLogs: () => apiClient.get<WorkoutLog[]>('/workouts/logs'),
};

// ================= PROGRESS & WATER API =================
export const progressApi = {
  getWeightLogs: () => apiClient.get<WeightLog[]>('/progress/weight'),

  logWeight: (weightKg: number, date?: string, notes?: string) =>
    apiClient.post<WeightLog>('/progress/weight', {
      weightKg,
      date: date || new Date().toISOString().split('T')[0],
      notes,
    }),

  getMeasurements: () => apiClient.get<BodyMeasurement[]>('/progress/measurements'),

  logMeasurement: (data: Partial<BodyMeasurement>) =>
    apiClient.post<BodyMeasurement>('/progress/measurements', {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
    }),

  getTodayWater: (date?: string) =>
    apiClient.get<{ logs: WaterLog[]; totalMl: number; targetMl: number; remainingMl: number }>(
      '/water/daily',
      { params: { date } },
    ),

  logWater: (amountMl: number, date?: string) =>
    apiClient.post<WaterLog>('/water/log', {
      amountMl,
      date: date || new Date().toISOString().split('T')[0],
    }),

  quickAddWater: (amountMl: number = 250) =>
    apiClient.post<WaterLog>('/water/quick-add', { amountMl }),
};

// ================= DASHBOARD API =================
export const dashboardApi = {
  getDashboard: () => apiClient.get<DashboardData>('/dashboard'),
};
