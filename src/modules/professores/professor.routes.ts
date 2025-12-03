/**
 * ============================================
 * SIGEA Backend - Rotas de Professores
 * ============================================
 */

import { Router } from 'express';
import { professorController } from './professor.controller';
import { authMiddleware } from '../../shared/middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => professorController.findAll(req, res, next));
router.get('/:id', (req, res, next) => professorController.findById(req, res, next));
router.post('/', (req, res, next) => professorController.create(req, res, next));
router.put('/:id', (req, res, next) => professorController.update(req, res, next));
router.delete('/:id', (req, res, next) => professorController.delete(req, res, next));

export { router as professorRoutes };

export default router;
