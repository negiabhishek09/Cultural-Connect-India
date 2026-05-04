import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { logger } from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ status: 'error', message: `Route ${req.originalUrl} not found` });
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.message, { stack: err.stack });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message });
    return;
  }

  if ((err as NodeJS.ErrnoException).code === '11000') {
    // ✅ Fix: unknown pehle, phir Record<string, unknown>
    const field = Object.keys(((err as unknown) as Record<string, unknown>).keyValue as Record<string, unknown> ?? {})[0] ?? 'field';
    res.status(409).json({ status: 'error', message: `A record with this ${field} already exists.` });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(422).json({ status: 'error', message: 'Validation failed.', errors: messages });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ status: 'error', message: `Invalid ${err.path}: ${err.value}` });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ status: 'error', message: 'Invalid token.' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ status: 'error', message: 'Token expired. Please login again.' });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message,
  });
};