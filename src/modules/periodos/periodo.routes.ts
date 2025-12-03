/**
 * ============================================
 * SIGEA Backend - Rotas de Períodos Letivos
 * ============================================
 */

import { Router } from 'express';
import { periodoController } from './periodo.controller';
import { authMiddleware } from '../../shared/middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => periodoController.findAll(req, res, next));
router.get('/:id', (req, res, next) => periodoController.findById(req, res, next));
router.post('/', (req, res, next) => periodoController.create(req, res, next));
router.put('/:id', (req, res, next) => periodoController.update(req, res, next));
router.delete('/:id', (req, res, next) => periodoController.delete(req, res, next));

export { router as periodoRoutes };

export default router;
