/**
 * ============================================
 * SIGEA Backend - DTOs de Alunos
 * ============================================
 * Schemas Zod para validação de entrada/saída
 */

import { z } from 'zod';

/**
 * Schema de criação de aluno
 * Campos alinhados com o schema Prisma
 */
export const alunoSchema = z.object({
  idTurma: z.number().int().positive({ message: 'ID da turma é obrigatório' }),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  matricula: z.string().min(1, 'Matrícula é obrigatória').max(30),
  dataNascimento: z.coerce.date().optional().nullable(),
  email: z.string().email('Email inválido').max(100).optional().nullable(),
  telefoneResponsavel: z.string().max(20).optional().nullable(),
});

/**
 * Schema de atualização de aluno (todos os campos opcionais)
 */
export const alunoUpdateSchema = alunoSchema.partial();

export type AlunoInput = z.infer<typeof alunoSchema>;
export type AlunoUpdateInput = z.infer<typeof alunoUpdateSchema>;
