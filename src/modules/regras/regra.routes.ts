/**
 * ============================================
 * SIGEA Backend - Rotas de Regras de Aprovação
 * ============================================
 * 
 * Endpoints disponíveis:
 * - GET    /api/regras                  → Lista todas as regras
 * - GET    /api/regras/:id              → Busca regra por ID
 * - GET    /api/regras/escola/:idEscola → Lista regras por escola
 * - POST   /api/regras                  → Cria nova regra
 * - PUT    /api/regras/:id              → Atualiza regra existente
 * - DELETE /api/regras/:id              → Remove regra
 */

import { Router } from 'express';
import { regraController } from './regra.controller';
import { authMiddleware, authorizeRoles } from '../../shared/middlewares';

const router = Router();

/**
 * @swagger
 * /regras:
 *   get:
 *     summary: Lista todas as regras de aprovação
 *     description: Retorna uma lista paginada de regras com detalhes de escola e coordenador
 *     tags: [Regras de Aprovação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Registros por página
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Lista de regras retornada com sucesso
 */
router.get('/', authMiddleware, regraController.findAll.bind(regraController));

/**
 * @swagger
 * /regras/escola/{idEscola}:
 *   get:
 *     summary: Lista regras de uma escola
 *     description: Retorna todas as regras de aprovação de uma escola específica
 *     tags: [Regras de Aprovação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idEscola
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da escola
 *     responses:
 *       200:
 *         description: Lista de regras da escola retornada com sucesso
 *       404:
 *         description: Escola não encontrada
 */
router.get('/escola/:idEscola', authMiddleware, regraController.findByEscola.bind(regraController));

/**
 * @swagger
 * /regras/{id}:
 *   get:
 *     summary: Busca regra por ID
 *     description: Retorna uma regra específica com todas as informações relacionadas
 *     tags: [Regras de Aprovação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da regra
 *     responses:
 *       200:
 *         description: Regra encontrada
 *       404:
 *         description: Regra não encontrada
 */
router.get('/:id', authMiddleware, regraController.findById.bind(regraController));

/**
 * @swagger
 * /regras:
 *   post:
 *     summary: Cria nova regra de aprovação
 *     description: Registra uma nova regra de aprovação para uma escola
 *     tags: [Regras de Aprovação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idEscola
 *               - idCoordenador
 *             properties:
 *               idEscola:
 *                 type: integer
 *                 example: 1
 *                 description: ID da escola
 *               idCoordenador:
 *                 type: integer
 *                 example: 1
 *                 description: ID do coordenador responsável
 *               notaMinima:
 *                 type: number
 *                 format: float
 *                 example: 6.0
 *                 default: 6.0
 *                 description: Nota mínima para aprovação (0-10)
 *               frequenciaMinima:
 *                 type: number
 *                 format: float
 *                 example: 75.0
 *                 default: 75.0
 *                 description: Frequência mínima para aprovação (0-100%)
 *               descricao:
 *                 type: string
 *                 example: "Regra padrão de aprovação 2025"
 *                 description: Descrição da regra
 *     responses:
 *       201:
 *         description: Regra criada com sucesso
 *       400:
 *         description: Dados inválidos ou coordenador não pertence à escola
 *       404:
 *         description: Escola ou coordenador não encontrado
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  regraController.create.bind(regraController)
);

/**
 * @swagger
 * /regras/{id}:
 *   put:
 *     summary: Atualiza regra
 *     description: Atualiza os dados de uma regra de aprovação existente
 *     tags: [Regras de Aprovação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da regra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idEscola:
 *                 type: integer
 *               idCoordenador:
 *                 type: integer
 *               notaMinima:
 *                 type: number
 *                 format: float
 *               frequenciaMinima:
 *                 type: number
 *                 format: float
 *               descricao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Regra atualizada com sucesso
 *       400:
 *         description: Coordenador não pertence à escola
 *       404:
 *         description: Regra não encontrada
 */
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  regraController.update.bind(regraController)
);

/**
 * @swagger
 * /regras/{id}:
 *   delete:
 *     summary: Remove regra
 *     description: Remove uma regra de aprovação do sistema
 *     tags: [Regras de Aprovação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da regra
 *     responses:
 *       200:
 *         description: Regra removida com sucesso
 *       404:
 *         description: Regra não encontrada
 */
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  regraController.delete.bind(regraController)
);

export { router as regraRoutes };
