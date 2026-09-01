import {
  Difficulty,
  Equipment,
  ExerciseCategory,
  FitnessGoal,
  Gender,
  MuscleGroup,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Create Admin User
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fitnessplatform.com' },
    update: {},
    create: {
      email: 'admin@fitnessplatform.com',
      fullName: 'System Administrator',
      passwordHash,
      role: UserRole.ADMIN,
      profile: {
        create: {
          age: 30,
          gender: Gender.MALE,
          heightCm: 175,
          currentWeightKg: 75,
          targetWeightKg: 72,
          fitnessGoal: FitnessGoal.GENERAL_FITNESS,
          activityLevel: 'MODERATELY_ACTIVE' as any,
          dietaryPreference: 'VEGETARIAN' as any,
          isOnboardingCompleted: true,
        },
      },
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // 2. Seed Global Food Database (Indian & Global Staples)
  const foods = [
    { name: 'Roti (Whole Wheat)', category: 'Grains', servingSize: 30, servingUnit: 'piece', calories: 80, protein: 3, carbs: 16, fat: 0.5, fiber: 2, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'White Rice (Cooked)', category: 'Grains', servingSize: 100, servingUnit: 'g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'Brown Rice (Cooked)', category: 'Grains', servingSize: 100, servingUnit: 'g', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'Yellow Dal Tadka', category: 'Pulses', servingSize: 150, servingUnit: 'bowl', calories: 160, protein: 9, carbs: 22, fat: 4, fiber: 4, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'Rajma Masala (Kidney Beans)', category: 'Pulses', servingSize: 150, servingUnit: 'bowl', calories: 180, protein: 10, carbs: 26, fat: 4.5, fiber: 6, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'Chole Masala (Chickpeas)', category: 'Pulses', servingSize: 150, servingUnit: 'bowl', calories: 210, protein: 11, carbs: 28, fat: 6, fiber: 7, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'Paneer (Raw / Cottage Cheese)', category: 'Dairy', servingSize: 100, servingUnit: 'g', calories: 265, protein: 18, carbs: 3.5, fat: 20, fiber: 0, cuisine: 'Indian', isVegetarian: true, isVegan: false },
    { name: 'Grilled Chicken Breast', category: 'Poultry', servingSize: 100, servingUnit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, cuisine: 'Continental', isVegetarian: false, isVegan: false },
    { name: 'Whole Boiled Egg', category: 'Poultry', servingSize: 50, servingUnit: 'piece', calories: 74, protein: 6.3, carbs: 0.4, fat: 5, fiber: 0, cuisine: 'Continental', isVegetarian: false, isVegan: false },
    { name: 'Egg White (Boiled)', category: 'Poultry', servingSize: 33, servingUnit: 'piece', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, fiber: 0, cuisine: 'Continental', isVegetarian: false, isVegan: false },
    { name: 'Poha with Peanuts & Veggies', category: 'Grains', servingSize: 150, servingUnit: 'bowl', calories: 220, protein: 5, carbs: 36, fat: 7, fiber: 3, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'Upma (Semolina)', category: 'Grains', servingSize: 150, servingUnit: 'bowl', calories: 190, protein: 4.5, carbs: 32, fat: 5.5, fiber: 2.5, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'Idli (Steamed)', category: 'Grains', servingSize: 50, servingUnit: 'piece', calories: 60, protein: 2, carbs: 12, fat: 0.2, fiber: 1, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'Plain Dosa', category: 'Grains', servingSize: 80, servingUnit: 'piece', calories: 130, protein: 3, carbs: 22, fat: 3.5, fiber: 1.5, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'Chicken Biryani', category: 'Prepared Dishes', servingSize: 250, servingUnit: 'plate', calories: 450, protein: 24, carbs: 52, fat: 16, fiber: 2.5, cuisine: 'Indian', isVegetarian: false, isVegan: false },
    { name: 'Mixed Veg Sabzi', category: 'Vegetables', servingSize: 150, servingUnit: 'bowl', calories: 120, protein: 3, carbs: 14, fat: 6, fiber: 4, cuisine: 'Indian', isVegetarian: true, isVegan: true },
    { name: 'Curd / Plain Dahi', category: 'Dairy', servingSize: 100, servingUnit: 'g', calories: 60, protein: 3.5, carbs: 4.7, fat: 3.1, fiber: 0, cuisine: 'Indian', isVegetarian: true, isVegan: false },
    { name: 'Rolled Oats (Raw)', category: 'Grains', servingSize: 40, servingUnit: 'g', calories: 150, protein: 5.3, carbs: 27, fat: 2.6, fiber: 4, cuisine: 'Continental', isVegetarian: true, isVegan: true },
    { name: 'Banana', category: 'Fruits', servingSize: 100, servingUnit: 'piece', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, cuisine: 'Fruits', isVegetarian: true, isVegan: true },
    { name: 'Whey Protein Isolate', category: 'Supplements', servingSize: 30, servingUnit: 'scoop', calories: 120, protein: 25, carbs: 1.5, fat: 1, fiber: 0, cuisine: 'Continental', isVegetarian: true, isVegan: false },
  ];

  for (const food of foods) {
    const existing = await prisma.foodItem.findFirst({
      where: { name: food.name, isGlobal: true },
    });
    if (!existing) {
      await prisma.foodItem.create({
        data: {
          ...food,
          isGlobal: true,
        },
      });
    }
  }
  console.log(`✅ Seeded ${foods.length} Global Food Items.`);

  // 3. Seed Global Exercise Library
  const exercises = [
    { name: 'Barbell Bench Press', muscleGroup: MuscleGroup.CHEST, category: ExerciseCategory.STRENGTH, equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE, instructions: ['Lie on bench', 'Lower bar to mid chest', 'Press explosively'] },
    { name: 'Incline Dumbbell Press', muscleGroup: MuscleGroup.CHEST, category: ExerciseCategory.HYPERTROPHY, equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER, instructions: ['Set bench to 30 degrees', 'Press dumbbells up with control'] },
    { name: 'Cable Chest Fly', muscleGroup: MuscleGroup.CHEST, category: ExerciseCategory.HYPERTROPHY, equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER, instructions: ['Bring cables together in a hugging motion'] },
    { name: 'Barbell Deadlift', muscleGroup: MuscleGroup.BACK, category: ExerciseCategory.STRENGTH, equipment: Equipment.BARBELL, difficulty: Difficulty.ADVANCED, instructions: ['Keep spine neutral', 'Hinge hips', 'Drive through heels'] },
    { name: 'Lat Pulldown', muscleGroup: MuscleGroup.BACK, category: ExerciseCategory.HYPERTROPHY, equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER, instructions: ['Pull bar to upper chest', 'Squeeze lats'] },
    { name: 'Barbell Back Squat', muscleGroup: MuscleGroup.LEGS, category: ExerciseCategory.STRENGTH, equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE, instructions: ['Squat to parallel', 'Keep chest high'] },
    { name: 'Leg Press', muscleGroup: MuscleGroup.LEGS, category: ExerciseCategory.HYPERTROPHY, equipment: Equipment.MACHINE, difficulty: Difficulty.BEGINNER, instructions: ['Place feet shoulder width', 'Lower smoothly'] },
    { name: 'Overhead Shoulder Press', muscleGroup: MuscleGroup.SHOULDERS, category: ExerciseCategory.STRENGTH, equipment: Equipment.BARBELL, difficulty: Difficulty.INTERMEDIATE, instructions: ['Press overhead without overarching back'] },
    { name: 'Lateral Raises', muscleGroup: MuscleGroup.SHOULDERS, category: ExerciseCategory.HYPERTROPHY, equipment: Equipment.DUMBBELL, difficulty: Difficulty.BEGINNER, instructions: ['Raise arms to parallel with floor'] },
    { name: 'Barbell Biceps Curl', muscleGroup: MuscleGroup.BICEPS, category: ExerciseCategory.HYPERTROPHY, equipment: Equipment.BARBELL, difficulty: Difficulty.BEGINNER, instructions: ['Keep elbows tucked', 'Curl bar smoothly'] },
    { name: 'Triceps Rope Pushdown', muscleGroup: MuscleGroup.TRICEPS, category: ExerciseCategory.HYPERTROPHY, equipment: Equipment.CABLE, difficulty: Difficulty.BEGINNER, instructions: ['Extend arms fully downwards'] },
    { name: 'Plank Hold', muscleGroup: MuscleGroup.CORE, category: ExerciseCategory.CALISTHENICS, equipment: Equipment.BODYWEIGHT, difficulty: Difficulty.BEGINNER, instructions: ['Maintain straight line from head to heels'] },
  ];

  for (const ex of exercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: ex.name, isGlobal: true },
    });
    if (!existing) {
      await prisma.exercise.create({
        data: {
          ...ex,
          isGlobal: true,
        },
      });
    }
  }
  console.log(`✅ Seeded ${exercises.length} Global Exercises.`);

  console.log('🎉 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
