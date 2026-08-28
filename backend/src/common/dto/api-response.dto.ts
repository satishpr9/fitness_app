export class ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
  timestamp: string;

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
    this.timestamp = this.timestamp || new Date().toISOString();
  }

  static success<T>(data: T, message?: string, meta?: any): ApiResponse<T> {
    return new ApiResponse<T>({
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  static error(message: string, meta?: any): ApiResponse<null> {
    return new ApiResponse<null>({
      success: false,
      message,
      data: null,
      meta,
      timestamp: new Date().toISOString(),
    });
  }
}
