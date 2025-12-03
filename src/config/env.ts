/**
 * ============================================
 * SIGEA Backend - Configuração de Ambiente
 * ============================================
 * Carrega e valida variáveis de ambiente usando Zod
 * Centraliza todas as configurações do sistema
 * ============================================
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Carregar variáveis do arquivo .env
dotenv.config();

/**
 * Schema de validação das variáveis de ambiente
 * Garante que todas as variáveis obrigatórias estejam presentes
 */
const envSchema = z.object({
  // Banco de dados
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),

  // Servidor
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Autenticação JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:4200'),

  // Upload de arquivos
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'), // 10MB
  ALLOWED_MIME_TYPES: z.string().default('application/pdf'),

  // Logs
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

/**
 * Tipo inferido das variáveis de ambiente validadas
 */
type Env = z.infer<typeof envSchema>;

/**
 * Valida e exporta as variáveis de ambiente
 * Lança erro se alguma variável obrigatória estiver faltando
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`);
      console.error('❌ Erro nas variáveis de ambiente:');
      console.error(missingVars.join('\n'));
      console.error('\n📝 Copie .env.example para .env e preencha os valores necessários.');
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Configurações do ambiente validadas e tipadas
 */
export const env = validateEnv();

/**
 * Configurações derivadas para uso no sistema
 */
export const config = {
  /** Configurações do banco de dados */
  database: {
    url: env.DATABASE_URL,
  },

  /** Configurações do servidor Express */
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isDev: env.NODE_ENV === 'development',
    isProd: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  /** Configurações de autenticação JWT */
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },

  /** Configurações de CORS */
  cors: {
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  },

  /** Configurações de upload de arquivos */
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedMimeTypes: env.ALLOWED_MIME_TYPES.split(',').map((t) => t.trim()),
  },

  /** Configurações de log */
  log: {
    level: env.LOG_LEVEL,
  },
} as const;

export default config;
