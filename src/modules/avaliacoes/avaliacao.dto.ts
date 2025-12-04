/**
 * ============================================
 * SIGEA Backend - DTOs de Avaliações
 * ============================================
 * Schemas Zod para validação de avaliações (provas)
 * Usa coerce para lidar com FormData (strings)
 */

import { z } from 'zod';

/**
 * Schema de criação de avaliação
 * Campos alinhados com schema Prisma
 * Usa z.coerce para converter strings de FormData para números
 */
export const avaliacaoSchema = z.object({
  idTurmaProfessor: z.coerce.number().int().positive({ message: 'ID do vínculo turma-professor é obrigatório' }),
  idPeriodoLetivo: z.coerce.number().int().positive({ message: 'ID do período letivo é obrigatório' }),
  titulo: z.string().min(1, 'Título é obrigatório').max(100),
  tipo: z.string().max(30).optional().nullable(),
  dataAplicacao: z.coerce.date(),
  peso: z.coerce.number().min(0.1).max(10).default(1.0),
  // arquivoProva é tratado separadamente via upload
});

/**
 * Schema de atualização de avaliação (todos os campos opcionais)
 */
export const avaliacaoUpdateSchema = avaliacaoSchema.partial();

export type AvaliacaoInput = z.infer<typeof avaliacaoSchema>;
export type AvaliacaoUpdateInput = z.infer<typeof avaliacaoUpdateSchema>;
