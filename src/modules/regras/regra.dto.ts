/**
 * ============================================
 * SIGEA Backend - DTOs de Regras de Aprovação
 * ============================================
 * Schemas Zod para validação de regras de aprovação por escola
 */

import { z } from 'zod';

/**
 * Schema de criação de regra de aprovação
 * Campos alinhados com schema Prisma
 */
export const regraAprovacaoSchema = z.object({
  idEscola: z.number().int().positive({ message: 'ID da escola é obrigatório' }),
  idCoordenador: z.number().int().positive({ message: 'ID do coordenador é obrigatório' }),
  anoLetivo: z.number().int().min(2000).max(2100),
  mediaMinima: z.number().min(0).max(10).default(6.0),
});

/**
 * Schema de atualização de regra (todos os campos opcionais)
 */
export const regraAprovacaoUpdateSchema = regraAprovacaoSchema.partial();

export type RegraAprovacaoInput = z.infer<typeof regraAprovacaoSchema>;
export type RegraAprovacaoUpdateInput = z.infer<typeof regraAprovacaoUpdateSchema>;
