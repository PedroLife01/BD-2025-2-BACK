/**
 * ============================================
 * SIGEA Backend - Rotas de Escolas
 * ============================================
 * Definição das rotas do módulo escolas
 * ============================================
 */

import { Router } from 'express';
import { escolaController } from './escola.controller';
import { authMiddleware } from '../../shared/middlewares';

/**
 * Router de escolas
 * Base path: /api/escolas
 */
const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/escolas
 * @desc Lista todas as escolas (paginado)
 * @access Private
 */
router.get('/', (req, res, next) => escolaController.findAll(req, res, next));

/**
 * @route GET /api/escolas/:id
 * @desc Busca escola por ID
 * @access Private
 */
router.get('/:id', (req, res, next) => escolaController.findById(req, res, next));

/**
 * @route POST /api/escolas
 * @desc Cria nova escola
 * @access Private
 */
router.post('/', (req, res, next) => escolaController.create(req, res, next));

/**
 * @route PUT /api/escolas/:id
 * @desc Atualiza escola
 * @access Private
 */
router.put('/:id', (req, res, next) => escolaController.update(req, res, next));

/**
 * @route DELETE /api/escolas/:id
 * @desc Remove escola
 * @access Private
 */
router.delete('/:id', (req, res, next) => escolaController.delete(req, res, next));

/**
 * @route GET /api/escolas/:id/turmas
 * @desc Lista turmas da escola
 * @access Private
 */
router.get('/:id/turmas', (req, res, next) => escolaController.findTurmas(req, res, next));

/**
 * @route GET /api/escolas/:id/professores
 * @desc Lista professores da escola
 * @access Private
 */
router.get('/:id/professores', (req, res, next) => escolaController.findProfessores(req, res, next));

/**
 * @route GET /api/escolas/:id/coordenadores
 * @desc Lista coordenadores da escola
 * @access Private
 */
router.get('/:id/coordenadores', (req, res, next) => escolaController.findCoordenadores(req, res, next));

export { router as escolaRoutes };

export default router;
