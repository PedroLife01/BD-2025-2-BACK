/**
 * ============================================
 * SIGEA Backend - Middleware de Autenticação
 * ============================================
 * Valida token JWT nas requisições protegidas
 * Adiciona dados do usuário e contexto de escola ao request
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config, prisma } from '../../config';

// Tipo Role baseado no schema Prisma
type Role = 'ADMIN' | 'COORDENADOR' | 'PROFESSOR' | 'ALUNO';

/**
 * Payload decodificado do token JWT
 */
interface JwtPayload {
  userId: number;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

/**
 * Contexto do usuário autenticado
 */
interface UserContext {
  id: number;
  email: string;
  role: Role;
  idEscola?: number | null;
  idProfessor?: number | null;
  idCoordenador?: number | null;
  idAluno?: number | null;
  idTurma?: number | null;
}

/**
 * Extensão do Request do Express para incluir dados do usuário autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido e adiciona dados do usuário ao request
 * Inclui contexto de escola baseado no vínculo do usuário
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Obtém o header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido',
        error: 'MISSING_TOKEN',
      });
      return;
    }

    // Verifica formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>',
        error: 'INVALID_TOKEN_FORMAT',
      });
      return;
    }

    const token = parts[1];

    if (!token || !config.jwt.secret) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticação inválido',
        error: 'INVALID_TOKEN',
      });
      return;
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, config.jwt.secret as jwt.Secret) as JwtPayload;

    // Busca usuário com vínculos para determinar contexto de escola
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        ativo: true,
        idProfessor: true,
        idCoordenador: true,
        idAluno: true,
        professor: {
          select: { idEscola: true }
        },
        coordenador: {
          select: { idEscola: true }
        },
        aluno: {
          select: { 
            idTurma: true,
            turma: {
              select: { idEscola: true }
            }
          }
        }
      },
    });

    if (!user || !user.ativo) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Determina o idEscola baseado no vínculo do usuário
    let idEscola: number | null = null;
    let idTurma: number | null = null;

    if (user.professor) {
      idEscola = user.professor.idEscola;
    } else if (user.coordenador) {
      idEscola = user.coordenador.idEscola;
    } else if (user.aluno) {
      idTurma = user.aluno.idTurma;
      idEscola = user.aluno.turma?.idEscola || null;
    }

    // Adiciona dados do usuário ao request com contexto completo
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      idEscola,
      idProfessor: user.idProfessor,
      idCoordenador: user.idCoordenador,
      idAluno: user.idAluno,
      idTurma,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado. Faça login novamente',
        error: 'TOKEN_EXPIRED',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'INVALID_TOKEN',
      });
      return;
    }

    next(error);
  }
}

/**
 * Middleware de autorização por role
 * Verifica se o usuário tem permissão para acessar o recurso
 *
 * @param allowedRoles - Roles permitidas para acessar o recurso
 */
export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'NOT_AUTHENTICATED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso',
        error: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware opcional de autenticação
 * Tenta autenticar mas não bloqueia se não houver token
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  return authMiddleware(req, res, next);
}

/**
 * Helper para obter filtro de escola baseado no usuário
 * ADMIN vê tudo, outros usuários só veem dados da sua escola
 */
export function getEscolaFilter(user?: UserContext): { idEscola?: number } | {} {
  if (!user) return {};
  if (user.role === 'ADMIN') return {};
  if (user.idEscola) return { idEscola: user.idEscola };
  return {};
}

/**
 * Helper para verificar se usuário pode acessar dados de uma escola específica
 */
export function canAccessEscola(user: UserContext | undefined, idEscola: number): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return user.idEscola === idEscola;
}

/**
 * Helper para verificar se professor pode acessar uma turma
 * (só se tiver vínculo com ela)
 */
export async function canProfessorAccessTurma(idProfessor: number, idTurma: number): Promise<boolean> {
  const vinculo = await prisma.turmaProfessor.findFirst({
    where: {
      idProfessor,
      idTurma,
    },
  });
  return !!vinculo;
}

/**
 * Helper para verificar se aluno pode acessar dados
 * (só os próprios dados)
 */
export function canAlunoAccessData(user: UserContext | undefined, idAluno: number): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'COORDENADOR') return true;
  if (user.role === 'ALUNO') return user.idAluno === idAluno;
  return false;
}

export default authMiddleware;
