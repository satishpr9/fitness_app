import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SubscriptionTier, UserRole } from '@prisma/client';

export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  app_metadata?: {
    role?: UserRole;
    tier?: SubscriptionTier;
    [key: string]: any;
  };
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  exp?: number;
}

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(
  Strategy,
  'supabase-jwt',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        config.get<string>('supabase.jwtSecret') ||
        config.get<string>('jwt.secret') ||
        'fitness-platform-super-secret-jwt-key-2026',
    });
  }

  async validate(payload: SupabaseJwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid JWT payload: missing sub');
    }

    const appMeta = payload.app_metadata || {};
    const userMeta = payload.user_metadata || {};

    return {
      userId: payload.sub,
      email: payload.email || '',
      fullName: userMeta.full_name,
      role: appMeta.role || UserRole.USER,
      tier: appMeta.tier || SubscriptionTier.FREE,
      isSuperAdmin: appMeta.role === UserRole.ADMIN,
      appMetadata: appMeta,
      userMetadata: userMeta,
    };
  }
}
