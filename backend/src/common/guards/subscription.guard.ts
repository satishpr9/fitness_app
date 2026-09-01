import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PRO_KEY } from '../decorators/require-pro.decorator';
import { SubscriptionTier, UserRole } from '@prisma/client';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requirePro = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_PRO_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirePro) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User must be authenticated');
    }

    if (user.role === UserRole.ADMIN || user.tier === SubscriptionTier.PREMIUM) {
      return true;
    }

    throw new ForbiddenException(
      'This feature requires an active PREMIUM subscription.',
    );
  }
}
