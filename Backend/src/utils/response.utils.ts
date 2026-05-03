import { Response } from 'express';

interface PaginationMeta { page: number; limit: number; total: number; totalPages: number; }

export const sendSuccess = (res: Response, data: unknown, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ status: 'success', message, data });

export const sendPaginated = (res: Response, data: unknown, meta: PaginationMeta, message = 'Success') =>
  res.status(200).json({ status: 'success', message, data, meta });

export const sendError = (res: Response, message: string, statusCode = 400, errors?: unknown) =>
  res.status(statusCode).json({ status: 'error', message, ...(errors && { errors }) });

export const parsePagination = (query: Record<string, unknown>) => {
  const page  = Math.max(1, parseInt(String(query.page  || '1')));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'))));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};