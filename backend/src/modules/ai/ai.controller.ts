import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AiDietService } from './ai-diet.service';
import { AiWorkoutService } from './ai-workout.service';
import { AiCoachService } from './ai-coach.service';
import {
  AiCoachChatDto,
  GenerateAiDietDto,
  GenerateAiWorkoutDto,
} from './dto/ai-requests.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('ai')
@UseGuards(TenantGuard)
export class AiController {
  constructor(
    private readonly aiDietService: AiDietService,
    private readonly aiWorkoutService: AiWorkoutService,
    private readonly aiCoachService: AiCoachService,
  ) {}

  /**
   * Generate structured AI Diet Plan
   */
  @Post('diet/generate')
  generateDiet(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateAiDietDto,
  ) {
    return this.aiDietService.generateDietPlan(tenantId, user.userId, dto);
  }

  /**
   * Generate structured AI Workout Plan
   */
  @Post('workout/generate')
  generateWorkout(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateAiWorkoutDto,
  ) {
    return this.aiWorkoutService.generateWorkoutPlan(tenantId, user.userId, dto);
  }

  /**
   * Chat with AI Fitness Coach
   */
  @Post('coach/chat')
  chatWithCoach(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AiCoachChatDto,
  ) {
    return this.aiCoachService.chat(tenantId, user.userId, dto);
  }

  /**
   * Get AI Coach conversation history
   */
  @Get('coach/conversations/:conversationId')
  getHistory(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.aiCoachService.getConversationHistory(tenantId, user.userId, conversationId);
  }
}
