/**
 * ============================================
 * SIGEA Backend - DTOs de Disciplina
 * ============================================
 */

import { z } from 'zod';

export const disciplinaSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  cargaHoraria: z
    .number()
    .int('Carga horária deve ser um número inteiro')
    .positive('Carga horária deve ser positiva')
    .optional()
    .nullable(),
  areaConhecimento: z
    .string()
    .max(100, 'Área de conhecimento deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
});

export const disciplinaUpdateSchema = disciplinaSchema.partial();

export type DisciplinaInput = z.infer<typeof disciplinaSchema>;
export type DisciplinaUpdateInput = z.infer<typeof disciplinaUpdateSchema>;
