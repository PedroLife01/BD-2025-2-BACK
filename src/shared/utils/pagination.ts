/**
 * ============================================
 * SIGEA Backend - Utilitários de Paginação
 * ============================================
 * Helpers para paginação consistente em todas as listagens
 * ============================================
 */

import { z } from 'zod';

/**
 * Schema de validação para parâmetros de paginação
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  orderBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Interface de resposta paginada
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Calcula skip e take para queries Prisma
 */
export function getPaginationParams(params: PaginationParams) {
  const { page, limit } = params;
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Monta objeto de resposta paginada
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

/**
 * Interface de resposta padrão de sucesso
 */
export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

/**
 * Cria resposta de sucesso padrão
 */
export function createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    ...(message && { message }),
    data,
  };
}
