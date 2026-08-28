import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If already formatted as ApiResponse, return directly
        if (res && typeof res === 'object' && 'success' in res && 'timestamp' in res) {
          return res;
        }

        // If result has items and total, format pagination meta
        if (res && typeof res === 'object' && 'items' in res && 'total' in res) {
          const { items, total, page, limit, ...restMeta } = res;
          return ApiResponse.success(items, 'Success', {
            total,
            page,
            limit,
            totalPages: limit ? Math.ceil(total / limit) : 1,
            ...restMeta,
          });
        }

        return ApiResponse.success(res, 'Success');
      }),
    );
  }
}
