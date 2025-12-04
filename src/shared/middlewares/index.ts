/**
 * ============================================
 * SIGEA Backend - Exportação dos Middlewares
 * ============================================
 * Barrel file para facilitar imports
 * ============================================
 */

export {
  authMiddleware,
  authorizeRoles,
  optionalAuthMiddleware,
  getEscolaFilter,
  canAccessEscola,
  canProfessorAccessTurma,
  canAlunoAccessData,
} from './auth.middleware';

export {
  uploadMiddleware,
  uploadPdfMiddleware,
  handleUploadErrors,
} from './upload.middleware';

export {
  errorHandler,
  notFoundHandler,
  AppError,
  Errors,
} from './error.middleware';
