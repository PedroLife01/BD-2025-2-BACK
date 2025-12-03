/**
 * ============================================
 * SIGEA Backend - DTOs de Turma-Professor
 * ============================================
 * Schemas Zod para validação de vínculos entre turmas, professores e disciplinas
 */

import { z } from 'zod';

/**
 * Schema de criação de vínculo turma-professor
 */
export const turmaProfessorSchema = z.object({
  idTurma: z.number().int().positive({ message: 'ID da turma é obrigatório' }),
  idProfessor: z.number().int().positive({ message: 'ID do professor é obrigatório' }),
  idDisciplina: z.number().int().positive({ message: 'ID da disciplina é obrigatório' }),
});

/**
 * Schema de atualização de vínculo (todos os campos opcionais)
 */
export const turmaProfessorUpdateSchema = turmaProfessorSchema.partial();

export type TurmaProfessorInput = z.infer<typeof turmaProfessorSchema>;
export type TurmaProfessorUpdateInput = z.infer<typeof turmaProfessorUpdateSchema>;
