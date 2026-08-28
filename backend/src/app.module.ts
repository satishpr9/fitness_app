import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './core/config/configuration';
import { DatabaseModule } from './core/database/database.module';
import { SupabaseModule } from './core/supabase/supabase.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CustomersModule } from './modules/customers/customers.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { FoodsModule } from './modules/foods/foods.module';
import { DietsModule } from './modules/diets/diets.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { ProgressModule } from './modules/progress/progress.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    SupabaseModule,
    AuthModule,
    TenantsModule,
    CustomersModule,
    NutritionModule,
    FoodsModule,
    DietsModule,
    ExercisesModule,
    WorkoutsModule,
    ProgressModule,
    DashboardModule,
    AiModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
