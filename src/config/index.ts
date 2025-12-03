/**
 * ============================================
 * SIGEA Backend - Exportação das Configurações
 * ============================================
 * Barrel file para facilitar imports
 * ============================================
 */

export { config, env } from './env';
export { prisma, connectDatabase, disconnectDatabase } from './database';
export { corsMiddleware, corsOptions } from './cors';
