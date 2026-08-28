import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Create Default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'apex-fitness' },
    update: {},
    create: {
      name: 'Apex Fitness Club',
      slug: 'apex-fitness',
      type: 'GYM',
      status: 'ACTIVE',
      settings: {
        create: {
          primaryColor: '#10B981',
          waterDefaultTargetMl: 2500,
          allowedAiPlansPerMonth: 200,
          supportedCuisines: ['Indian', 'Continental', 'Asian', 'Mediterranean'],
        },
      },
      subscriptions: {
        create: {
          planTier: 'ENTERPRISE',
          status: 'ACTIVE',
          maxCustomers: 1000,
          maxTrainers: 50,
          maxNutritionists: 20,
          aiFeaturesEnabled: true,
        },
      },
    },
  });
  console.log(`✅ Default Tenant created: ${tenant.name} (${tenant.id})`);

  // 2. Create Super Admin User
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@fitnessplatform.com' },
    update: {},
    create: {
      email: 'admin@fitnessplatform.com',
      fullName: 'Super Administrator',
      passwordHash,
      isSuperAdmin: true,
      tenantUsers: {
        create: {
          tenantId: tenant.id,
          role: UserRole.SUPER_ADMIN,
          status: 'ACTIVE',
        },
      },
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // 3. Seed Global Food Database (Indian & Global Staples)
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
    await prisma.foodItem.upsert({
      where: { id: `00000000-0000-0000-0000-${food.name.replace(/[^a-zA-Z]/g, '').slice(0, 12).padEnd(12, '0')}` },
      update: {},
      create: {
        ...food,
        isGlobal: true,
      },
    }).catch(async () => {
      await prisma.foodItem.create({
        data: {
          ...food,
          isGlobal: true,
        },
      });
    });
  }
  console.log(`✅ Seeded ${foods.length} Global Food Items.`);

  // 4. Seed Global Exercise Library
  const exercises = [
    { name: 'Barbell Bench Press', muscleGroup: 'CHEST' as any, category: 'STRENGTH' as any, equipment: 'BARBELL' as any, difficulty: 'INTERMEDIATE' as any, instructions: ['Lie on bench', 'Lower bar to mid chest', 'Press explosively'] },
    { name: 'Incline Dumbbell Press', muscleGroup: 'CHEST' as any, category: 'HYPERTROPHY' as any, equipment: 'DUMBBELL' as any, difficulty: 'BEGINNER' as any, instructions: ['Set bench to 30 degrees', 'Press dumbbells up with control'] },
    { name: 'Cable Chest Fly', muscleGroup: 'CHEST' as any, category: 'HYPERTROPHY' as any, equipment: 'CABLE' as any, difficulty: 'BEGINNER' as any, instructions: ['Bring cables together in a hugging motion'] },
    { name: 'Barbell Deadlift', muscleGroup: 'BACK' as any, category: 'STRENGTH' as any, equipment: 'BARBELL' as any, difficulty: 'ADVANCED' as any, instructions: ['Keep spine neutral', 'Hinge hips', 'Drive through heels'] },
    { name: 'Lat Pulldown', muscleGroup: 'BACK' as any, category: 'HYPERTROPHY' as any, equipment: 'CABLE' as any, difficulty: 'BEGINNER' as any, instructions: ['Pull bar to upper chest', 'Squeeze lats'] },
    { name: 'Barbell Back Squat', muscleGroup: 'LEGS' as any, category: 'STRENGTH' as any, equipment: 'BARBELL' as any, difficulty: 'INTERMEDIATE' as any, instructions: ['Squat to parallel', 'Keep chest high'] },
    { name: 'Leg Press', muscleGroup: 'LEGS' as any, category: 'HYPERTROPHY' as any, equipment: 'MACHINE' as any, difficulty: 'BEGINNER' as any, instructions: ['Place feet shoulder width', 'Lower smoothly'] },
    { name: 'Overhead Shoulder Press', muscleGroup: 'SHOULDERS' as any, category: 'STRENGTH' as any, equipment: 'BARBELL' as any, difficulty: 'INTERMEDIATE' as any, instructions: ['Press overhead without overarching back'] },
    { name: 'Lateral Raises', muscleGroup: 'SHOULDERS' as any, category: 'HYPERTROPHY' as any, equipment: 'DUMBBELL' as any, difficulty: 'BEGINNER' as any, instructions: ['Raise arms to parallel with floor'] },
    { name: 'Barbell Biceps Curl', muscleGroup: 'BICEPS' as any, category: 'HYPERTROPHY' as any, equipment: 'BARBELL' as any, difficulty: 'BEGINNER' as any, instructions: ['Keep elbows tucked', 'Curl bar smoothly'] },
    { name: 'Triceps Rope Pushdown', muscleGroup: 'TRICEPS' as any, category: 'HYPERTROPHY' as any, equipment: 'CABLE' as any, difficulty: 'BEGINNER' as any, instructions: ['Extend arms fully downwards'] },
    { name: 'Plank Hold', muscleGroup: 'CORE' as any, category: 'CALISTHENICS' as any, equipment: 'BODYWEIGHT' as any, difficulty: 'BEGINNER' as any, instructions: ['Maintain straight line from head to heels'] },
  ];

  for (const ex of exercises) {
    await prisma.exercise.create({
      data: {
        ...ex,
        isGlobal: true,
      },
    }).catch(() => {});
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
