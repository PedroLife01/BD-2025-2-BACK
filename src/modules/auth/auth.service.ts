/**
 * ============================================
 * SIGEA Backend - Serviço de Autenticação
 * ============================================
 * Lógica de negócio para autenticação
 * Registro, login e geração de JWT
 * ============================================
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, config } from '../../config';
import { RegisterInput, LoginInput, UserResponse, AuthResponse } from './auth.dto';
import { AppError } from '../../shared/middlewares';

/**
 * Serviço de autenticação
 * Contém métodos para registro, login e validação de usuários
 */
export class AuthService {
  /**
   * Número de rounds para o hash bcrypt
   * Maior = mais seguro, mas mais lento
   */
  private readonly SALT_ROUNDS = 10;

  /**
   * Registra um novo usuário no sistema
   *
   * @param data - Dados do usuário (nome, email, senha, role)
   * @returns Token JWT e dados do usuário
   * @throws AppError se email já existir
   *
   * @example
   * const result = await authService.register({
   *   nome: 'João Silva',
   *   email: 'joao@escola.com',
   *   senha: 'senha123',
   *   role: 'PROFESSOR'
   * });
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    // Verifica se email já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email já cadastrado no sistema', 409, 'EMAIL_EXISTS');
    }

    // Gera hash da senha
    const senhaHash = await bcrypt.hash(data.senha as string, this.SALT_ROUNDS);

    // Cria usuário no banco
    const user = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senhaHash,
        role: data.role,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
      },
    });

    // Gera token JWT
    const token = this.generateToken(user);

    return {
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        token,
        user,
      },
    };
  }

  /**
   * Realiza login do usuário
   *
   * @param data - Email e senha
   * @returns Token JWT e dados do usuário
   * @throws AppError se credenciais inválidas
   *
   * @example
   * const result = await authService.login({
   *   email: 'joao@escola.com',
   *   senha: 'senha123'
   * });
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    // Busca usuário por email com dados de aluno se for ALUNO
    const user = await prisma.usuario.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        senhaHash: true,
        ativo: true,
        aluno: {
          select: {
            id: true,
            matricula: true,
            turma: {
              select: {
                id: true,
                nome: true,
                serie: true,
                turno: true,
                escola: {
                  select: {
                    id: true,
                    nome: true,
                  }
                }
              }
            }
          }
        }
      },
    });

    // Usuário não encontrado
    if (!user) {
      throw new AppError('Email ou senha inválidos', 401, 'INVALID_CREDENTIALS');
    }

    // Usuário inativo
    if (!user.ativo) {
      throw new AppError('Usuário desativado. Entre em contato com o administrador', 401, 'USER_INACTIVE');
    }

    // Verifica senha
    const senhaValida = await bcrypt.compare(data.senha, user.senhaHash);

    if (!senhaValida) {
      throw new AppError('Email ou senha inválidos', 401, 'INVALID_CREDENTIALS');
    }

    // Remove senha do objeto de resposta e adiciona dados de aluno se existir
    const userResponse: UserResponse & { aluno?: any } = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    };

    // Adiciona dados do aluno se existir
    if (user.aluno) {
      userResponse.aluno = user.aluno;
    }

    // Gera token JWT
    const token = this.generateToken(userResponse);

    return {
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: userResponse,
      },
    };
  }

  /**
   * Retorna dados do usuário autenticado
   *
   * @param userId - ID do usuário
   * @returns Dados do usuário
   * @throws AppError se usuário não encontrado
   */
  async getProfile(userId: number): Promise<UserResponse> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Gera token JWT para o usuário
   *
   * @param user - Dados do usuário para incluir no token
   * @returns Token JWT assinado
   */
  private generateToken(user: UserResponse): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret as jwt.Secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }
}

/**
 * Instância singleton do serviço
 */
export const authService = new AuthService();

export default authService;
