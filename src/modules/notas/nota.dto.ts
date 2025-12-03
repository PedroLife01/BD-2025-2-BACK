/**
 * ============================================
 * SIGEA Backend - DTOs de Notas
 * ============================================
 * Schemas Zod para validação de notas de alunos
 */

import { z } from 'zod';

/**
 * Schema de criação de nota
 * Campo alinhado com schema Prisma: notaObtida
 */
export const notaSchema = z.object({
  idAvaliacao: z.number().int().positive({ message: 'ID da avaliação é obrigatório' }),
  idAluno: z.number().int().positive({ message: 'ID do aluno é obrigatório' }),
  notaObtida: z.number().min(0, 'Nota deve ser >= 0').max(10, 'Nota deve ser <= 10'),
});

/**
 * Schema de atualização de nota (apenas notaObtida pode ser alterada)
 */
export const notaUpdateSchema = z.object({
  notaObtida: z.number().min(0, 'Nota deve ser >= 0').max(10, 'Nota deve ser <= 10'),
});

/**
 * Schema para lançamento de múltiplas notas de uma vez
 */
export const notasBatchSchema = z.object({
  idAvaliacao: z.number().int().positive({ message: 'ID da avaliação é obrigatório' }),
  notas: z.array(
    z.object({
      idAluno: z.number().int().positive(),
      notaObtida: z.number().min(0).max(10),
    })
  ).min(1, 'Pelo menos uma nota deve ser informada'),
});

export type NotaInput = z.infer<typeof notaSchema>;
export type NotaUpdateInput = z.infer<typeof notaUpdateSchema>;
export type NotasBatchInput = z.infer<typeof notasBatchSchema>;
