/**
 * ============================================
 * SIGEA Backend - Middleware de Autenticação
 * ============================================
 * Valida token JWT nas requisições protegidas
 * Adiciona dados do usuário ao request
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config, prisma } from '../../config';

// Tipo Role baseado no schema Prisma
type Role = 'ADMIN' | 'COORDENADOR' | 'PROFESSOR';

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
 * Extensão do Request do Express para incluir dados do usuário autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: Role;
      };
    }
  }
}

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido e adiciona dados do usuário ao request
 *
 * @example
 * // Proteger uma rota específica
 * router.get('/perfil', authMiddleware, (req, res) => {
 *   res.json({ user: req.user });
 * });
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

    // Verifica se o usuário ainda existe e está ativo
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, ativo: true },
    });

    if (!user || !user.ativo) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Adiciona dados do usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
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
 *
 * @example
 * // Apenas admins e coordenadores podem acessar
 * router.delete('/escola/:id',
 *   authMiddleware,
 *   authorizeRoles(Role.ADMIN, Role.COORDENADOR),
 *   escolaController.delete
 * );
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
 * Útil para rotas que podem ter comportamento diferente para usuários logados
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

  // Delega para o middleware de autenticação padrão
  return authMiddleware(req, res, next);
}

export default authMiddleware;
