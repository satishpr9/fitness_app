import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextData {
  tenantId?: string;
  userId?: string;
  role?: string;
}

export const tenantContextStorage = new AsyncLocalStorage<TenantContextData>();

export class TenantContext {
  static get(): TenantContextData | undefined {
    return tenantContextStorage.getStore();
  }

  static getTenantId(): string | undefined {
    return tenantContextStorage.getStore()?.tenantId;
  }

  static getUserId(): string | undefined {
    return tenantContextStorage.getStore()?.userId;
  }

  static getRole(): string | undefined {
    return tenantContextStorage.getStore()?.role;
  }
}
