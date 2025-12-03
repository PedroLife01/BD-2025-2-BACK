/**
 * ============================================
 * SIGEA Backend - Rotas de Alunos
 * ============================================
 * 
 * Endpoints disponíveis:
 * - GET    /api/alunos                     → Lista todos os alunos (com paginação)
 * - GET    /api/alunos/:id                 → Busca aluno por ID
 * - GET    /api/alunos/matricula/:matricula → Busca aluno por matrícula
 * - POST   /api/alunos                     → Cria novo aluno
 * - PUT    /api/alunos/:id                 → Atualiza aluno existente
 * - DELETE /api/alunos/:id                 → Remove aluno
 * - GET    /api/alunos/:id/notas           → Lista notas do aluno
 */

import { Router } from 'express';
import { alunoController } from './aluno.controller';
import { authMiddleware, authorizeRoles } from '../../shared/middlewares';

const router = Router();

/**
 * @swagger
 * /alunos:
 *   get:
 *     summary: Lista todos os alunos
 *     description: Retorna uma lista paginada de alunos com informações da turma e escola
 *     tags: [Alunos]
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
 *         description: Busca por nome, matrícula ou email
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Ordenação
 *     responses:
 *       200:
 *         description: Lista de alunos retornada com sucesso
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
 *                     $ref: '#/components/schemas/Aluno'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', authMiddleware, alunoController.findAll.bind(alunoController));

/**
 * @swagger
 * /alunos/matricula/{matricula}:
 *   get:
 *     summary: Busca aluno por matrícula
 *     description: Retorna um aluno específico baseado na matrícula
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matricula
 *         required: true
 *         schema:
 *           type: string
 *         description: Matrícula do aluno
 *     responses:
 *       200:
 *         description: Aluno encontrado
 *       404:
 *         description: Aluno não encontrado
 */
router.get('/matricula/:matricula', authMiddleware, alunoController.findByMatricula.bind(alunoController));

/**
 * @swagger
 * /alunos/{id}:
 *   get:
 *     summary: Busca aluno por ID
 *     description: Retorna um aluno específico com turma, escola e notas
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Aluno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Aluno'
 *       404:
 *         description: Aluno não encontrado
 */
router.get('/:id', authMiddleware, alunoController.findById.bind(alunoController));

/**
 * @swagger
 * /alunos:
 *   post:
 *     summary: Cadastra novo aluno
 *     description: Registra um novo aluno vinculado a uma turma
 *     tags: [Alunos]
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
 *               - nome
 *               - matricula
 *             properties:
 *               idTurma:
 *                 type: integer
 *                 example: 1
 *                 description: ID da turma
 *               nome:
 *                 type: string
 *                 example: "João da Silva"
 *                 description: Nome completo do aluno
 *               matricula:
 *                 type: string
 *                 example: "2025001"
 *                 description: Matrícula única do aluno
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *                 example: "2010-05-15"
 *                 description: Data de nascimento
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.silva@email.com"
 *               telefone:
 *                 type: string
 *                 example: "(61) 99999-9999"
 *               situacao:
 *                 type: string
 *                 enum: [ATIVO, INATIVO, TRANSFERIDO, FORMADO]
 *                 default: ATIVO
 *     responses:
 *       201:
 *         description: Aluno cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Turma não encontrada
 *       409:
 *         description: Matrícula já cadastrada
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  alunoController.create.bind(alunoController)
);

/**
 * @swagger
 * /alunos/{id}:
 *   put:
 *     summary: Atualiza aluno
 *     description: Atualiza os dados de um aluno existente
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idTurma:
 *                 type: integer
 *               nome:
 *                 type: string
 *               matricula:
 *                 type: string
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *               email:
 *                 type: string
 *                 format: email
 *               telefone:
 *                 type: string
 *               situacao:
 *                 type: string
 *                 enum: [ATIVO, INATIVO, TRANSFERIDO, FORMADO]
 *     responses:
 *       200:
 *         description: Aluno atualizado com sucesso
 *       404:
 *         description: Aluno ou turma não encontrada
 *       409:
 *         description: Matrícula já cadastrada para outro aluno
 */
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  alunoController.update.bind(alunoController)
);

/**
 * @swagger
 * /alunos/{id}:
 *   delete:
 *     summary: Remove aluno
 *     description: Remove um aluno do sistema
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Aluno removido com sucesso
 *       404:
 *         description: Aluno não encontrado
 */
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  alunoController.delete.bind(alunoController)
);

/**
 * @swagger
 * /alunos/{id}/notas:
 *   get:
 *     summary: Lista notas do aluno
 *     description: Retorna todas as notas de um aluno com detalhes das avaliações
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Lista de notas retornada com sucesso
 *       404:
 *         description: Aluno não encontrado
 */
router.get('/:id/notas', authMiddleware, alunoController.findNotas.bind(alunoController));

export { router as alunoRoutes };
