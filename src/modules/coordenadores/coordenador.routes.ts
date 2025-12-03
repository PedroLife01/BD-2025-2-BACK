/**
 * ============================================
 * SIGEA Backend - Rotas de Coordenadores
 * ============================================
 */

import { Router } from 'express';
import { coordenadorController } from './coordenador.controller';
import { authMiddleware } from '../../shared/middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => coordenadorController.findAll(req, res, next));
router.get('/:id', (req, res, next) => coordenadorController.findById(req, res, next));
router.post('/', (req, res, next) => coordenadorController.create(req, res, next));
router.put('/:id', (req, res, next) => coordenadorController.update(req, res, next));
router.delete('/:id', (req, res, next) => coordenadorController.delete(req, res, next));

export { router as coordenadorRoutes };

export default router;
