/**
 * ============================================
 * SIGEA Backend - Middleware de Upload
 * ============================================
 * Configuração do Multer para upload de arquivos
 * Suporta upload de PDF para avaliações
 * ============================================
 */

import multer from 'multer';
import { Request } from 'express';
import { config } from '../../config';

/**
 * Armazenamento em memória (buffer)
 * O arquivo será salvo no banco de dados como BYTEA
 */
const memoryStorage = multer.memoryStorage();

/**
 * Filtro de tipos de arquivo permitidos
 * Valida o MIME type do arquivo antes do upload
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void => {
  // Verifica se o tipo do arquivo é permitido
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `Tipo de arquivo não permitido: ${file.mimetype}. ` +
        `Tipos permitidos: ${config.upload.allowedMimeTypes.join(', ')}`
      )
    );
  }
};

/**
 * Configuração do Multer para upload de PDF
 *
 * @example
 * // Usar em uma rota
 * router.post(
 *   '/avaliacoes/:id/arquivo',
 *   uploadMiddleware.single('arquivo'),
 *   avaliacaoController.uploadArquivo
 * );
 */
export const uploadMiddleware = multer({
  storage: memoryStorage,
  limits: {
    fileSize: config.upload.maxFileSize, // Tamanho máximo do arquivo
    files: 1, // Apenas 1 arquivo por requisição
  },
  fileFilter,
});

// Alias para compatibilidade
export const uploadPdfMiddleware = uploadMiddleware.single('arquivo');

/**
 * Middleware wrapper para tratar erros do Multer de forma amigável
 */
export const handleUploadErrors = (
  err: Error,
  _req: Request,
  res: import('express').Response,
  next: import('express').NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    // Erros específicos do Multer
    const errorMessages: Record<string, string> = {
      LIMIT_FILE_SIZE: `Arquivo muito grande. Tamanho máximo: ${config.upload.maxFileSize / 1024 / 1024}MB`,
      LIMIT_FILE_COUNT: 'Apenas um arquivo é permitido por requisição',
      LIMIT_UNEXPECTED_FILE: 'Campo de arquivo inesperado. Use o campo "arquivo"',
    };

    res.status(400).json({
      success: false,
      message: errorMessages[err.code] || err.message,
      error: err.code,
    });
    return;
  }

  if (err.message.includes('Tipo de arquivo não permitido')) {
    res.status(400).json({
      success: false,
      message: err.message,
      error: 'INVALID_FILE_TYPE',
    });
    return;
  }

  // Outros erros são passados para o error handler global
  next(err);
};

export default uploadMiddleware;
