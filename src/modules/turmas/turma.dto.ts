/**
 * ============================================
 * SIGEA Backend - DTOs de Turma
 * ============================================
 */

import { z } from 'zod';

export const turmaSchema = z.object({
  idEscola: z
    .number({ required_error: 'ID da escola é obrigatório' })
    .int('ID da escola deve ser um número inteiro')
    .positive('ID da escola deve ser positivo'),
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim(),
  anoLetivo: z
    .number({ required_error: 'Ano letivo é obrigatório' })
    .int('Ano letivo deve ser um número inteiro')
    .min(2000, 'Ano mínimo é 2000')
    .max(2100, 'Ano máximo é 2100'),
  serie: z
    .string()
    .max(20, 'Série deve ter no máximo 20 caracteres')
    .optional()
    .nullable(),
  turno: z
    .string()
    .max(20, 'Turno deve ter no máximo 20 caracteres')
    .optional()
    .nullable(),
});

export const turmaUpdateSchema = turmaSchema.partial();

export type TurmaInput = z.infer<typeof turmaSchema>;
export type TurmaUpdateInput = z.infer<typeof turmaUpdateSchema>;
