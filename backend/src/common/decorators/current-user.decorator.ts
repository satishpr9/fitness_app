import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SubscriptionTier, UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  fullName?: string;
  role: UserRole;
  tier: SubscriptionTier;
  isSuperAdmin?: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;
    return data ? user?.[data] : user;
  },
);
