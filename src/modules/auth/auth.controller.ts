/**
 * ============================================
 * SIGEA Backend - Controller de Autenticação
 * ============================================
 * Handlers HTTP para endpoints de autenticação
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.dto';

/**
 * Controller de autenticação
 * Processa requisições HTTP e delega para o service
 */
export class AuthController {
  /**
   * POST /api/auth/register
   * Registra um novo usuário no sistema
   *
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Registrar novo usuário
   *     description: Cria uma nova conta de usuário no sistema
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: Usuário registrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       409:
   *         description: Email já cadastrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Valida dados de entrada
      const data = registerSchema.parse(req.body);

      // Registra usuário
      const result = await authService.register(data);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Realiza login e retorna token JWT
   *
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Fazer login
   *     description: Autentica usuário e retorna token JWT
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         description: Credenciais inválidas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // DEBUG: Log do body recebido
      console.log('🔍 Login request body:', JSON.stringify(req.body, null, 2));
      
      // Valida dados de entrada
      const data = loginSchema.parse(req.body);

      // Realiza login
      const result = await authService.login(data);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/profile
   * Retorna dados do usuário autenticado
   *
   * @swagger
   * /api/auth/profile:
   *   get:
   *     tags: [Auth]
   *     summary: Obter perfil do usuário
   *     description: Retorna dados do usuário autenticado
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dados do usuário
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     nome:
   *                       type: string
   *                     email:
   *                       type: string
   *                     role:
   *                       type: string
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.user é definido pelo authMiddleware
      const userId = req.user!.id;

      const user = await authService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

/**
 * Instância do controller
 */
export const authController = new AuthController();

export default authController;
