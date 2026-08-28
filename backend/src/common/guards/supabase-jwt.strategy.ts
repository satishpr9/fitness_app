import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  app_metadata?: {
    tenant_id?: string;
    role?: UserRole;
    roles?: UserRole[];
    is_super_admin?: boolean;
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
      isSuperAdmin: appMeta.is_super_admin || false,
      tenantId: appMeta.tenant_id,
      role: appMeta.role,
      roles: appMeta.roles || (appMeta.role ? [appMeta.role] : []),
      appMetadata: appMeta,
      userMetadata: userMeta,
    };
  }
}
