/**
 * ============================================
 * SIGEA Backend - Rotas de Autenticação
 * ============================================
 * Definição das rotas do módulo auth
 * ============================================
 */

import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../shared/middlewares';

/**
 * Router de autenticação
 * Base path: /api/auth
 */
const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Registra novo usuário
 * @access Public
 */
router.post('/register', (req, res, next) => authController.register(req, res, next));

/**
 * @route POST /api/auth/login
 * @desc Realiza login
 * @access Public
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * @route GET /api/auth/profile
 * @desc Retorna perfil do usuário autenticado
 * @access Private (requer autenticação)
 */
router.get('/profile', authMiddleware, (req, res, next) => authController.getProfile(req, res, next));

export { router as authRoutes };

export default router;
