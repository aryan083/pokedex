import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/response';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json(
        errorResponse(
          'Validation failed',
          'VALIDATION_ERROR'
        )
      );
    }
    return;
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: any) {
      return res.status(400).json(
        errorResponse(
          'Query validation failed',
          'VALIDATION_ERROR'
        )
      );
    }
    return;
  };
};