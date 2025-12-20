// Standard API response structure
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
  };
}

// Success response helper
export const successResponse = <T>(
  data: T,
  meta?: Record<string, any>,
  message?: string
): ApiResponse<T> => ({
  success: true,
  data,
  meta,
  message,
});

// Error response helper
export const errorResponse = (
  message: string,
  errorCode: string = 'INTERNAL_ERROR'
): ApiResponse<null> => ({
  success: false,
  message,
  error: {
    code: errorCode,
    message,
  },
});

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}