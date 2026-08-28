import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { tenantContextStorage } from '../context/tenant-context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const tenantIdHeader = req.headers['x-tenant-id'] as string;
    const user = (req as any).user;
    const tenantId = tenantIdHeader || user?.tenantId;

    if (tenantId) {
      (req as any).tenantId = tenantId;
    }

    tenantContextStorage.run(
      {
        tenantId,
        userId: user?.userId,
        role: user?.role,
      },
      () => {
        next();
      },
    );
  }
}
