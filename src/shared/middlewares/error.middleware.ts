/**
 * ============================================
 * SIGEA Backend - Middleware de Tratamento de Erros
 * ============================================
 * Captura e formata erros de forma consistente
 * Logs de erro e respostas padronizadas
 * ============================================
 */

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { config } from '../../config';

/**
 * Interface padrão de resposta de erro da API
 */
interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  details?: unknown;
  stack?: string;
}

/**
 * Classe de erro customizada da aplicação
 * Permite criar erros com código de status HTTP
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.name = 'AppError';

    // Captura o stack trace corretamente
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erros comuns pré-definidos para uso consistente
 */
export const Errors = {
  notFound: (resource: string) =>
    new AppError(`${resource} não encontrado(a)`, 404, 'NOT_FOUND'),

  badRequest: (message: string, details?: unknown) =>
    new AppError(message, 400, 'BAD_REQUEST', details),

  unauthorized: (message: string = 'Não autorizado') =>
    new AppError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message: string = 'Acesso negado') =>
    new AppError(message, 403, 'FORBIDDEN'),

  conflict: (message: string) =>
    new AppError(message, 409, 'CONFLICT'),

  validation: (details: unknown) =>
    new AppError('Erro de validação dos dados', 400, 'VALIDATION_ERROR', details),

  internal: (message: string = 'Erro interno do servidor') =>
    new AppError(message, 500, 'INTERNAL_ERROR'),
};

/**
 * Formata erros de validação do Zod
 */
function formatZodError(error: ZodError): { field: string; message: string }[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Formata erros do Prisma
 */
function formatPrismaError(error: PrismaClientKnownRequestError): {
  message: string;
  statusCode: number;
  errorCode: string;
} {
  const errorMap: Record<string, { message: string; statusCode: number; errorCode: string }> = {
    // Violação de constraint unique
    P2002: {
      message: `Registro duplicado. O campo '${(error.meta?.target as string[])?.join(', ') || 'desconhecido'}' já existe`,
      statusCode: 409,
      errorCode: 'DUPLICATE_ENTRY',
    },
    // Registro não encontrado
    P2025: {
      message: 'Registro não encontrado',
      statusCode: 404,
      errorCode: 'NOT_FOUND',
    },
    // Violação de foreign key
    P2003: {
      message: 'Operação viola restrição de chave estrangeira',
      statusCode: 400,
      errorCode: 'FOREIGN_KEY_VIOLATION',
    },
    // Valor inválido
    P2006: {
      message: 'Valor fornecido é inválido para o campo',
      statusCode: 400,
      errorCode: 'INVALID_VALUE',
    },
    // Campo obrigatório faltando
    P2012: {
      message: 'Campo obrigatório não fornecido',
      statusCode: 400,
      errorCode: 'MISSING_FIELD',
    },
  };

  return (
    errorMap[error.code] || {
      message: 'Erro no banco de dados',
      statusCode: 500,
      errorCode: 'DATABASE_ERROR',
    }
  );
}

/**
 * Middleware global de tratamento de erros
 * Deve ser registrado por último nas rotas do Express
 *
 * @example
 * // No index.ts, após todas as rotas
 * app.use(errorHandler);
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log do erro
  console.error('❌ Erro:', err);

  const response: ErrorResponse = {
    success: false,
    message: 'Erro interno do servidor',
    error: 'INTERNAL_ERROR',
  };

  let statusCode = 500;

  // AppError customizado
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.message = err.message;
    response.error = err.errorCode;
    response.details = err.details;
  }
  // Erro de validação Zod
  else if (err instanceof ZodError) {
    statusCode = 400;
    response.message = 'Erro de validação dos dados';
    response.error = 'VALIDATION_ERROR';
    response.details = formatZodError(err);
  }
  // Erro do Prisma
  else if (err instanceof PrismaClientKnownRequestError) {
    const prismaError = formatPrismaError(err);
    statusCode = prismaError.statusCode;
    response.message = prismaError.message;
    response.error = prismaError.errorCode;
  }
  // Erro de sintaxe JSON
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    response.message = 'JSON inválido no corpo da requisição';
    response.error = 'INVALID_JSON';
  }
  // Outros erros
  else if (err instanceof Error) {
    response.message = err.message || 'Erro interno do servidor';
  }

  // Em desenvolvimento, inclui stack trace
  if (config.server.isDev && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Middleware para rotas não encontradas (404)
 * Deve ser registrado após todas as rotas definidas
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    error: 'ROUTE_NOT_FOUND',
  });
};

export default errorHandler;
