/**
 * ============================================
 * SIGEA Backend - Rotas de Disciplinas
 * ============================================
 */

import { Router } from 'express';
import { disciplinaController } from './disciplina.controller';
import { authMiddleware } from '../../shared/middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => disciplinaController.findAll(req, res, next));
router.get('/:id', (req, res, next) => disciplinaController.findById(req, res, next));
router.post('/', (req, res, next) => disciplinaController.create(req, res, next));
router.put('/:id', (req, res, next) => disciplinaController.update(req, res, next));
router.delete('/:id', (req, res, next) => disciplinaController.delete(req, res, next));

export { router as disciplinaRoutes };

export default router;
