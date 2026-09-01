import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';

describe('B2C Fitness Platform Backend (e2e)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    foodItem: {
      findMany: jest.fn().mockImplementation((args) => {
        if (args?.select?.category) {
          return Promise.resolve([
            { category: 'Grains' },
            { category: 'Pulses' },
            { category: 'Dairy' },
            { category: 'Vegetables' },
          ]);
        }
        if (args?.select?.cuisine) {
          return Promise.resolve([
            { cuisine: 'Indian' },
            { cuisine: 'Continental' },
            { cuisine: 'Mediterranean' },
          ]);
        }
        return Promise.resolve([]);
      }),
      count: jest.fn().mockResolvedValue(0),
    },
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Nutrition Engine (Deterministic Calculations)', () => {
    it('/nutrition/calculate (POST) - should compute BMI, BMR, TDEE, Calorie targets and macro breakdown', () => {
      return request(app.getHttpServer())
        .post('/nutrition/calculate')
        .send({
          age: 26,
          gender: 'MALE',
          heightCm: 180,
          currentWeightKg: 80,
          fitnessGoal: 'WEIGHT_LOSS',
          activityLevel: 'MODERATELY_ACTIVE',
          workoutDaysPerWeek: 5,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          const data = res.body.data;
          expect(data.bmi).toBe(24.7);
          expect(data.bmiCategory).toBe('Normal weight');
          expect(data.bmr).toBe(1800);
          expect(data.tdee).toBe(2790);
          expect(data.dailyCalorieTarget).toBe(2290);
          expect(data.proteinTargetG).toBeGreaterThan(150);
          expect(data.carbsTargetG).toBeGreaterThan(150);
          expect(data.fatTargetG).toBeGreaterThan(50);
          expect(data.waterTargetMl).toBeGreaterThan(3000);
        });
    });
  });

  describe('Food Database Catalog', () => {
    it('/foods/categories (GET) - should return food category metadata', () => {
      return request(app.getHttpServer())
        .get('/foods/categories')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toEqual(['Grains', 'Pulses', 'Dairy', 'Vegetables']);
        });
    });

    it('/foods/cuisines (GET) - should return supported cuisines', () => {
      return request(app.getHttpServer())
        .get('/foods/cuisines')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toEqual(['Indian', 'Continental', 'Mediterranean']);
        });
    });
  });
});
