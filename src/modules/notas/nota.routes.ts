/**
 * ============================================
 * SIGEA Backend - Rotas de Notas
 * ============================================
 * 
 * Endpoints disponíveis:
 * - GET    /api/notas                     → Lista todas as notas
 * - GET    /api/notas/:id                 → Busca nota por ID
 * - GET    /api/notas/avaliacao/:idAvaliacao → Lista notas por avaliação
 * - GET    /api/notas/aluno/:idAluno      → Lista notas por aluno
 * - POST   /api/notas                     → Cria nova nota
 * - POST   /api/notas/batch               → Cria múltiplas notas de uma vez
 * - PUT    /api/notas/:id                 → Atualiza nota existente
 * - DELETE /api/notas/:id                 → Remove nota
 */

import { Router } from 'express';
import { notaController } from './nota.controller';
import { authMiddleware, authorizeRoles } from '../../shared/middlewares';

const router = Router();

/**
 * @swagger
 * /notas:
 *   get:
 *     summary: Lista todas as notas
 *     description: Retorna uma lista paginada de notas com informações de aluno e avaliação
 *     tags: [Notas]
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
 *         description: Lista de notas retornada com sucesso
 */
router.get('/', authMiddleware, notaController.findAll.bind(notaController));

/**
 * @swagger
 * /notas/avaliacao/{idAvaliacao}:
 *   get:
 *     summary: Lista notas de uma avaliação
 *     description: Retorna todas as notas de uma avaliação específica
 *     tags: [Notas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAvaliacao
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação
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
 *         description: Lista de notas retornada com sucesso
 *       404:
 *         description: Avaliação não encontrada
 */
router.get(
  '/avaliacao/:idAvaliacao',
  authMiddleware,
  notaController.findByAvaliacao.bind(notaController)
);

/**
 * @swagger
 * /notas/aluno/{idAluno}:
 *   get:
 *     summary: Lista notas de um aluno
 *     description: Retorna todas as notas de um aluno específico
 *     tags: [Notas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAluno
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
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
 *         description: Lista de notas retornada com sucesso
 *       404:
 *         description: Aluno não encontrado
 */
router.get('/aluno/:idAluno', authMiddleware, notaController.findByAluno.bind(notaController));

/**
 * @swagger
 * /notas/{id}:
 *   get:
 *     summary: Busca nota por ID
 *     description: Retorna uma nota específica com detalhes completos
 *     tags: [Notas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da nota
 *     responses:
 *       200:
 *         description: Nota encontrada
 *       404:
 *         description: Nota não encontrada
 */
router.get('/:id', authMiddleware, notaController.findById.bind(notaController));

/**
 * @swagger
 * /notas:
 *   post:
 *     summary: Cadastra nova nota
 *     description: Registra uma nota para um aluno em uma avaliação
 *     tags: [Notas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idAvaliacao
 *               - idAluno
 *               - nota
 *             properties:
 *               idAvaliacao:
 *                 type: integer
 *                 example: 1
 *                 description: ID da avaliação
 *               idAluno:
 *                 type: integer
 *                 example: 1
 *                 description: ID do aluno
 *               nota:
 *                 type: number
 *                 format: float
 *                 example: 8.5
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Nota do aluno (0-10)
 *     responses:
 *       201:
 *         description: Nota cadastrada com sucesso
 *       400:
 *         description: Dados inválidos ou aluno não pertence à turma
 *       404:
 *         description: Avaliação ou aluno não encontrado
 *       409:
 *         description: Já existe nota para este aluno nesta avaliação
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR', 'PROFESSOR'),
  notaController.create.bind(notaController)
);

/**
 * @swagger
 * /notas/batch:
 *   post:
 *     summary: Cadastra múltiplas notas
 *     description: Registra notas para vários alunos de uma vez em uma mesma avaliação
 *     tags: [Notas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idAvaliacao
 *               - notas
 *             properties:
 *               idAvaliacao:
 *                 type: integer
 *                 example: 1
 *                 description: ID da avaliação
 *               notas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - idAluno
 *                     - nota
 *                   properties:
 *                     idAluno:
 *                       type: integer
 *                       example: 1
 *                     nota:
 *                       type: number
 *                       format: float
 *                       example: 8.5
 *                       minimum: 0
 *                       maximum: 10
 *                 example:
 *                   - idAluno: 1
 *                     nota: 8.5
 *                   - idAluno: 2
 *                     nota: 7.0
 *                   - idAluno: 3
 *                     nota: 9.0
 *     responses:
 *       201:
 *         description: Notas cadastradas com sucesso
 *       400:
 *         description: Dados inválidos ou alunos não pertencem à turma
 *       404:
 *         description: Avaliação ou alunos não encontrados
 *       409:
 *         description: Já existem notas para alguns alunos nesta avaliação
 */
router.post(
  '/batch',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR', 'PROFESSOR'),
  notaController.createBatch.bind(notaController)
);

/**
 * @swagger
 * /notas/{id}:
 *   put:
 *     summary: Atualiza nota
 *     description: Atualiza o valor de uma nota existente
 *     tags: [Notas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da nota
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nota
 *             properties:
 *               nota:
 *                 type: number
 *                 format: float
 *                 example: 9.0
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Nova nota (0-10)
 *     responses:
 *       200:
 *         description: Nota atualizada com sucesso
 *       404:
 *         description: Nota não encontrada
 */
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR', 'PROFESSOR'),
  notaController.update.bind(notaController)
);

/**
 * @swagger
 * /notas/{id}:
 *   delete:
 *     summary: Remove nota
 *     description: Remove uma nota do sistema
 *     tags: [Notas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da nota
 *     responses:
 *       200:
 *         description: Nota removida com sucesso
 *       404:
 *         description: Nota não encontrada
 */
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  notaController.delete.bind(notaController)
);

export { router as notaRoutes };
