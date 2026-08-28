import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { PromptBuilderService } from './prompt-builder.service';
import { LlmService } from './llm.service';
import { FoodDiaryService } from '../diets/food-diary.service';
import { AiCoachChatDto } from './dto/ai-requests.dto';
import { PlanStatus } from '@prisma/client';

@Injectable()
export class AiCoachService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly llmService: LlmService,
    private readonly foodDiaryService: FoodDiaryService,
  ) {}

  /**
   * AI Fitness Coach Chat with Real-time Isolated Context
   */
  async chat(tenantId: string, userId: string, dto: AiCoachChatDto) {
    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch user context
    const [profile, target, dailyFood, activeWorkout] = await Promise.all([
      this.prisma.customerProfile.findUnique({
        where: { userId },
      }),
      this.prisma.nutritionTarget.findFirst({
        where: { tenantId, userId },
        orderBy: { updatedAt: 'desc' },
      }),
      this.foodDiaryService.getDailyLog(tenantId, userId, todayStr),
      this.prisma.workoutPlan.findFirst({
        where: { tenantId, customerId: userId, status: PlanStatus.ACTIVE },
        include: { days: { take: 1 } },
      }),
    ]);

    if (!profile) {
      throw new NotFoundException('Customer profile not found');
    }

    // Resolve or create conversation
    let conversationId = dto.conversationId;
    if (!conversationId) {
      const conv = await this.prisma.aiConversation.create({
        data: {
          tenantId,
          userId,
          title: 'Daily AI Coaching Session',
        },
      });
      conversationId = conv.id;
    }

    // Save user message
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content: dto.message,
      },
    });

    // Build Prompt with live context
    const systemPrompt = this.promptBuilder.buildCoachPrompt(
      profile,
      target,
      dailyFood.summary,
      activeWorkout?.days[0]?.dayName,
    );

    // Call LLM
    const replyText = await this.llmService.generateTextCompletion(
      systemPrompt,
      dto.message,
    );

    // Save assistant reply
    const assistantMessage = await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: replyText,
        metadata: {
          caloriesRemaining: dailyFood.summary.calories.remaining,
          proteinRemaining: dailyFood.summary.protein.remaining,
        },
      },
    });

    return {
      conversationId,
      message: assistantMessage,
    };
  }

  /**
   * Get chat history for conversation
   */
  async getConversationHistory(tenantId: string, userId: string, conversationId: string) {
    const conv = await this.prisma.aiConversation.findFirst({
      where: { id: conversationId, tenantId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    return conv;
  }
}
