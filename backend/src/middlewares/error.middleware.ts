import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response';
import { logger } from './requestLogger.middleware';

// Custom error classes
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json(
      errorResponse(
        'Validation failed',
        'VALIDATION_ERROR'
      )
    );
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(
        err.message,
        err.constructor.name.toUpperCase()
      )
    );
  }

  // Handle all other errors
  return res.status(500).json(
    errorResponse(
      'Internal server error',
      'INTERNAL_ERROR'
    )
  );
};