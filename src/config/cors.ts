/**
 * ============================================
 * SIGEA Backend - Configuração de CORS
 * ============================================
 * Cross-Origin Resource Sharing para comunicação
 * com o frontend Angular
 * ============================================
 */

import cors, { CorsOptions } from 'cors';
import { config } from './env';

/**
 * Opções de configuração do CORS
 * Permite requisições do frontend Angular e define headers permitidos
 */
export const corsOptions: CorsOptions = {
  /**
   * Origens permitidas (URLs do frontend)
   * Configurável via variável de ambiente CORS_ORIGIN
   */
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // Verifica se a origem está na lista de permitidas
    if (config.cors.origin.includes(origin)) {
      return callback(null, true);
    }

    // Em desenvolvimento, permite localhost em qualquer porta
    if (config.server.isDev && origin.includes('localhost')) {
      return callback(null, true);
    }

    // Bloqueia origens não permitidas
    return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
  },

  /**
   * Métodos HTTP permitidos
   */
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  /**
   * Headers permitidos nas requisições
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  /**
   * Headers expostos nas respostas (acessíveis pelo frontend)
   */
  exposedHeaders: [
    'Content-Disposition', // Para download de arquivos
    'X-Total-Count',       // Para paginação
  ],

  /**
   * Permite envio de cookies/credenciais
   */
  credentials: true,

  /**
   * Tempo de cache do preflight (em segundos)
   */
  maxAge: 86400, // 24 horas

  /**
   * Responde com sucesso às requisições OPTIONS (preflight)
   */
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Middleware CORS configurado
 */
export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
