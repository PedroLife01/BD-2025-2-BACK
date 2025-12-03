/**
 * ============================================
 * SIGEA Backend - Rotas de Turmas
 * ============================================
 * 
 * Endpoints disponíveis:
 * - GET    /api/turmas         → Lista todas as turmas (com paginação)
 * - GET    /api/turmas/:id     → Busca turma por ID
 * - POST   /api/turmas         → Cria nova turma
 * - PUT    /api/turmas/:id     → Atualiza turma existente
 * - DELETE /api/turmas/:id     → Remove turma
 * - GET    /api/turmas/:id/alunos → Lista alunos da turma
 */

import { Router } from 'express';
import { turmaController } from './turma.controller';
import { authMiddleware, authorizeRoles } from '../../shared/middlewares';

const router = Router();

/**
 * @swagger
 * /turmas:
 *   get:
 *     summary: Lista todas as turmas
 *     description: Retorna uma lista paginada de turmas com informações da escola
 *     tags: [Turmas]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome ou série
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Ordenação
 *     responses:
 *       200:
 *         description: Lista de turmas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Turma'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', authMiddleware, turmaController.findAll.bind(turmaController));

/**
 * @swagger
 * /turmas/{id}:
 *   get:
 *     summary: Busca turma por ID
 *     description: Retorna uma turma específica com escola, alunos e professores vinculados
 *     tags: [Turmas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da turma
 *     responses:
 *       200:
 *         description: Turma encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Turma'
 *       404:
 *         description: Turma não encontrada
 */
router.get('/:id', authMiddleware, turmaController.findById.bind(turmaController));

/**
 * @swagger
 * /turmas:
 *   post:
 *     summary: Cria nova turma
 *     description: Registra uma nova turma vinculada a uma escola
 *     tags: [Turmas]
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
 *               - nome
 *               - anoLetivo
 *             properties:
 *               idEscola:
 *                 type: integer
 *                 example: 1
 *                 description: ID da escola à qual a turma pertence
 *               nome:
 *                 type: string
 *                 example: "Turma A"
 *                 description: Nome identificador da turma
 *               anoLetivo:
 *                 type: integer
 *                 example: 2025
 *                 description: Ano letivo da turma
 *               serie:
 *                 type: string
 *                 example: "1º Ano"
 *                 description: Série ou ano escolar
 *               turno:
 *                 type: string
 *                 example: "Matutino"
 *                 description: Turno de funcionamento
 *     responses:
 *       201:
 *         description: Turma criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Escola não encontrada
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  turmaController.create.bind(turmaController)
);

/**
 * @swagger
 * /turmas/{id}:
 *   put:
 *     summary: Atualiza turma
 *     description: Atualiza os dados de uma turma existente
 *     tags: [Turmas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da turma
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idEscola:
 *                 type: integer
 *               nome:
 *                 type: string
 *               anoLetivo:
 *                 type: integer
 *               serie:
 *                 type: string
 *               turno:
 *                 type: string
 *     responses:
 *       200:
 *         description: Turma atualizada com sucesso
 *       404:
 *         description: Turma ou escola não encontrada
 */
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  turmaController.update.bind(turmaController)
);

/**
 * @swagger
 * /turmas/{id}:
 *   delete:
 *     summary: Remove turma
 *     description: Remove uma turma do sistema
 *     tags: [Turmas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da turma
 *     responses:
 *       200:
 *         description: Turma removida com sucesso
 *       404:
 *         description: Turma não encontrada
 */
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  turmaController.delete.bind(turmaController)
);

/**
 * @swagger
 * /turmas/{id}/alunos:
 *   get:
 *     summary: Lista alunos da turma
 *     description: Retorna uma lista paginada de alunos matriculados na turma
 *     tags: [Turmas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da turma
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de alunos retornada com sucesso
 *       404:
 *         description: Turma não encontrada
 */
router.get('/:id/alunos', authMiddleware, turmaController.findAlunos.bind(turmaController));

export { router as turmaRoutes };
