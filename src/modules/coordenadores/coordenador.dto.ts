/**
 * ============================================
 * SIGEA Backend - DTOs de Coordenador
 * ============================================
 */

import { z } from 'zod';

export const coordenadorSchema = z.object({
  idEscola: z
    .number({ required_error: 'ID da escola é obrigatório' })
    .int('ID da escola deve ser um número inteiro')
    .positive('ID da escola deve ser positivo'),
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
  telefone: z
    .string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .optional()
    .nullable(),
});

export const coordenadorUpdateSchema = coordenadorSchema.partial();

export type CoordenadorInput = z.infer<typeof coordenadorSchema>;
export type CoordenadorUpdateInput = z.infer<typeof coordenadorUpdateSchema>;
