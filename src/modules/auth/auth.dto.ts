/**
 * ============================================
 * SIGEA Backend - DTOs de Autenticação
 * ============================================
 * Schemas Zod para validação de entrada/saída
 * ============================================
 */

import { z } from 'zod';

// Tipo e valores do Role baseado no schema Prisma
type Role = 'ADMIN' | 'COORDENADOR' | 'PROFESSOR' | 'ALUNO';
const Role = {
  ADMIN: 'ADMIN' as const,
  COORDENADOR: 'COORDENADOR' as const,
  PROFESSOR: 'PROFESSOR' as const,
  ALUNO: 'ALUNO' as const,
};

/**
 * Schema de validação para registro de usuário
 */
export const registerSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .toLowerCase()
    .trim(),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  role: z
    .nativeEnum(Role, { errorMap: () => ({ message: 'Role inválida. Use: ADMIN, COORDENADOR, PROFESSOR ou ALUNO' }) })
    .optional()
    .default(Role.PROFESSOR),
});

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(1, 'Senha é obrigatória')
    .trim(),
});

/**
 * Tipos inferidos dos schemas
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Interface de resposta do usuário (sem senha)
 */
export interface UserResponse {
  id: number;
  nome: string;
  email: string;
  role: Role;
}

/**
 * Interface de resposta de autenticação
 */
export interface AuthResponse {
  success: true;
  message: string;
  data: {
    token: string;
    user: UserResponse;
  };
}
