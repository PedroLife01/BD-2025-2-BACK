/**
 * ============================================
 * SIGEA Backend - DTOs de Período Letivo
 * ============================================
 */

import { z } from 'zod';

export const periodoLetivoSchema = z.object({
  ano: z
    .number({ required_error: 'Ano é obrigatório' })
    .int('Ano deve ser um número inteiro')
    .min(2000, 'Ano mínimo é 2000')
    .max(2100, 'Ano máximo é 2100'),
  etapa: z
    .string({ required_error: 'Etapa é obrigatória' })
    .min(2, 'Etapa deve ter no mínimo 2 caracteres')
    .max(30, 'Etapa deve ter no máximo 30 caracteres')
    .trim(),
  dataInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  dataFim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

export const periodoLetivoUpdateSchema = periodoLetivoSchema.partial();

export type PeriodoLetivoInput = z.infer<typeof periodoLetivoSchema>;
export type PeriodoLetivoUpdateInput = z.infer<typeof periodoLetivoUpdateSchema>;
