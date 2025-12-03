/**
 * ============================================
 * SIGEA Backend - Configuração do Banco de Dados
 * ============================================
 * Instância singleton do Prisma Client
 * Gerencia conexão com PostgreSQL
 * ============================================
 */

import { PrismaClient } from '@prisma/client';
import { config } from './env';

/**
 * Extensão do namespace global para armazenar
 * instância do Prisma em desenvolvimento (evita múltiplas conexões)
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Configuração de logs do Prisma baseada no ambiente
 */
const prismaLogConfig = config.server.isDev
  ? {
      log: [
        { emit: 'stdout', level: 'query' } as const,
        { emit: 'stdout', level: 'error' } as const,
        { emit: 'stdout', level: 'warn' } as const,
      ],
    }
  : {
      log: [
        { emit: 'stdout', level: 'error' } as const,
      ],
    };

/**
 * Instância do Prisma Client
 * - Em desenvolvimento: reutiliza instância global (evita leak de conexões)
 * - Em produção: cria nova instância
 */
export const prisma = global.prisma ?? new PrismaClient(prismaLogConfig);

// Em desenvolvimento, armazena instância no global para reutilização
if (config.server.isDev) {
  global.prisma = prisma;
}

/**
 * Conecta ao banco de dados
 * Deve ser chamada na inicialização do servidor
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

/**
 * Desconecta do banco de dados
 * Deve ser chamada ao encerrar o servidor
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('🔌 Desconectado do banco de dados');
}

export default prisma;
