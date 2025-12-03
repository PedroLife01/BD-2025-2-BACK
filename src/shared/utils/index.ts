/**
 * ============================================
 * SIGEA Backend - Exportação dos Utilitários
 * ============================================
 */

export * from './pagination';

/**
 * Helper para extrair parâmetro de rota de forma segura
 * @param param - Parâmetro que pode ser string ou undefined
 * @param paramName - Nome do parâmetro para mensagem de erro
 * @returns Número inteiro parseado
 * @throws Error se o parâmetro for inválido
 */
export function parseIntParam(param: string | undefined, paramName = 'id'): number {
  if (!param) {
    throw new Error(`Parâmetro ${paramName} é obrigatório`);
  }
  const parsed = parseInt(param, 10);
  if (isNaN(parsed)) {
    throw new Error(`Parâmetro ${paramName} deve ser um número válido`);
  }
  return parsed;
}