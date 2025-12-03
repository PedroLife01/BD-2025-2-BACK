/**
 * ============================================
 * SIGEA Backend - Rotas de Vínculos (Turma-Professor-Disciplina)
 * ============================================
 * 
 * Endpoints disponíveis:
 * - GET    /api/vinculos                        → Lista todos os vínculos
 * - GET    /api/vinculos/:id                    → Busca vínculo por ID
 * - GET    /api/vinculos/professor/:idProfessor → Lista vínculos por professor
 * - GET    /api/vinculos/turma/:idTurma         → Lista vínculos por turma
 * - POST   /api/vinculos                        → Cria novo vínculo
 * - PUT    /api/vinculos/:id                    → Atualiza vínculo existente
 * - DELETE /api/vinculos/:id                    → Remove vínculo
 */

import { Router } from 'express';
import { vinculoController } from './vinculo.controller';
import { authMiddleware, authorizeRoles } from '../../shared/middlewares';

const router = Router();

/**
 * @swagger
 * /vinculos:
 *   get:
 *     summary: Lista todos os vínculos turma-professor
 *     description: Retorna uma lista paginada de vínculos com detalhes de turma, professor e disciplina
 *     tags: [Vínculos]
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
 *         description: Lista de vínculos retornada com sucesso
 */
router.get('/', authMiddleware, vinculoController.findAll.bind(vinculoController));

/**
 * @swagger
 * /vinculos/professor/{idProfessor}:
 *   get:
 *     summary: Lista vínculos de um professor
 *     description: Retorna todos os vínculos (turmas e disciplinas) de um professor específico
 *     tags: [Vínculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idProfessor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do professor
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
 *         description: Lista de vínculos do professor retornada com sucesso
 *       404:
 *         description: Professor não encontrado
 */
router.get('/professor/:idProfessor', authMiddleware, vinculoController.findByProfessor.bind(vinculoController));

/**
 * @swagger
 * /vinculos/turma/{idTurma}:
 *   get:
 *     summary: Lista vínculos de uma turma
 *     description: Retorna todos os vínculos (professores e disciplinas) de uma turma específica
 *     tags: [Vínculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTurma
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
 *         description: Lista de vínculos da turma retornada com sucesso
 *       404:
 *         description: Turma não encontrada
 */
router.get('/turma/:idTurma', authMiddleware, vinculoController.findByTurma.bind(vinculoController));

/**
 * @swagger
 * /vinculos/{id}:
 *   get:
 *     summary: Busca vínculo por ID
 *     description: Retorna um vínculo específico com todas as informações relacionadas
 *     tags: [Vínculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do vínculo
 *     responses:
 *       200:
 *         description: Vínculo encontrado
 *       404:
 *         description: Vínculo não encontrado
 */
router.get('/:id', authMiddleware, vinculoController.findById.bind(vinculoController));

/**
 * @swagger
 * /vinculos:
 *   post:
 *     summary: Cria novo vínculo turma-professor
 *     description: Vincula um professor a uma turma para lecionar uma disciplina específica
 *     tags: [Vínculos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idTurma
 *               - idProfessor
 *               - idDisciplina
 *             properties:
 *               idTurma:
 *                 type: integer
 *                 example: 1
 *                 description: ID da turma
 *               idProfessor:
 *                 type: integer
 *                 example: 1
 *                 description: ID do professor
 *               idDisciplina:
 *                 type: integer
 *                 example: 1
 *                 description: ID da disciplina que o professor lecionará
 *     responses:
 *       201:
 *         description: Vínculo criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Turma, professor ou disciplina não encontrada
 *       409:
 *         description: Vínculo já existe
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  vinculoController.create.bind(vinculoController)
);

/**
 * @swagger
 * /vinculos/{id}:
 *   put:
 *     summary: Atualiza vínculo
 *     description: Atualiza os dados de um vínculo existente
 *     tags: [Vínculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do vínculo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idTurma:
 *                 type: integer
 *               idProfessor:
 *                 type: integer
 *               idDisciplina:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Vínculo atualizado com sucesso
 *       404:
 *         description: Vínculo não encontrado
 */
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  vinculoController.update.bind(vinculoController)
);

/**
 * @swagger
 * /vinculos/{id}:
 *   delete:
 *     summary: Remove vínculo
 *     description: Remove um vínculo turma-professor do sistema
 *     tags: [Vínculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do vínculo
 *     responses:
 *       200:
 *         description: Vínculo removido com sucesso
 *       404:
 *         description: Vínculo não encontrado
 */
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  vinculoController.delete.bind(vinculoController)
);

export { router as vinculoRoutes };
