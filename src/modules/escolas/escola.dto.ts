/**
 * ============================================
 * SIGEA Backend - DTOs de Escola
 * ============================================
 * Schemas Zod para validação de entrada/saída
 * ============================================
 */

import { z } from 'zod';

/**
 * Schema de validação para criar/atualizar escola
 */
export const escolaSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  cnpj: z
    .string()
    .length(14, 'CNPJ deve ter exatamente 14 dígitos (sem pontuação)')
    .regex(/^\d{14}$/, 'CNPJ deve conter apenas números')
    .optional()
    .nullable(),
  telefone: z
    .string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .optional()
    .nullable(),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
  regiaoAdministrativa: z
    .string()
    .max(100, 'Região administrativa deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
});

/**
 * Schema para atualização parcial (todos campos opcionais)
 */
export const escolaUpdateSchema = escolaSchema.partial();

/**
 * Tipos inferidos dos schemas
 */
export type EscolaInput = z.infer<typeof escolaSchema>;
export type EscolaUpdateInput = z.infer<typeof escolaUpdateSchema>;
