/**
 * ============================================
 * SIGEA Backend - Rotas de Avaliações
 * ============================================
 * 
 * Endpoints disponíveis:
 * - GET    /api/avaliacoes                                → Lista todas as avaliações
 * - GET    /api/avaliacoes/:id                            → Busca avaliação por ID
 * - GET    /api/avaliacoes/vinculo/:idTurmaProfessor      → Lista avaliações por vínculo
 * - POST   /api/avaliacoes                                → Cria nova avaliação (com upload PDF)
 * - PUT    /api/avaliacoes/:id                            → Atualiza avaliação (com upload PDF)
 * - DELETE /api/avaliacoes/:id                            → Remove avaliação
 * - GET    /api/avaliacoes/:id/arquivo                    → Download do PDF da prova
 * - DELETE /api/avaliacoes/:id/arquivo                    → Remove apenas o arquivo
 */

import { Router } from 'express';
import { avaliacaoController } from './avaliacao.controller';
import { authMiddleware, authorizeRoles, uploadMiddleware } from '../../shared/middlewares';

const router = Router();

/**
 * @swagger
 * /avaliacoes:
 *   get:
 *     summary: Lista todas as avaliações
 *     description: Retorna uma lista paginada de avaliações com informações de turma, professor e disciplina
 *     tags: [Avaliações]
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
 *         description: Busca por descrição
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordenação por data
 *     responses:
 *       200:
 *         description: Lista de avaliações retornada com sucesso
 */
router.get('/', authMiddleware, avaliacaoController.findAll.bind(avaliacaoController));

/**
 * @swagger
 * /avaliacoes/vinculo/{idTurmaProfessor}:
 *   get:
 *     summary: Lista avaliações de um vínculo turma-professor
 *     description: Retorna todas as avaliações de uma combinação específica turma/professor/disciplina
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTurmaProfessor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do vínculo turma-professor
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
 *         description: Lista de avaliações retornada com sucesso
 *       404:
 *         description: Vínculo não encontrado
 */
router.get(
  '/vinculo/:idTurmaProfessor',
  authMiddleware,
  avaliacaoController.findByTurmaProfessor.bind(avaliacaoController)
);

/**
 * @swagger
 * /avaliacoes/{id}:
 *   get:
 *     summary: Busca avaliação por ID
 *     description: Retorna uma avaliação específica com todas as notas dos alunos
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação
 *     responses:
 *       200:
 *         description: Avaliação encontrada
 *       404:
 *         description: Avaliação não encontrada
 */
router.get('/:id', authMiddleware, avaliacaoController.findById.bind(avaliacaoController));

/**
 * @swagger
 * /avaliacoes/{id}/arquivo:
 *   get:
 *     summary: Download do arquivo da prova
 *     description: Baixa o arquivo PDF da prova associado à avaliação
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação
 *     responses:
 *       200:
 *         description: Arquivo PDF da prova
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Avaliação ou arquivo não encontrado
 */
router.get('/:id/arquivo', authMiddleware, avaliacaoController.downloadArquivo.bind(avaliacaoController));

/**
 * @swagger
 * /avaliacoes:
 *   post:
 *     summary: Cria nova avaliação
 *     description: Registra uma nova avaliação com possibilidade de upload do PDF da prova
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - idTurmaProfessor
 *               - idPeriodoLetivo
 *               - descricao
 *               - dataAvaliacao
 *             properties:
 *               idTurmaProfessor:
 *                 type: integer
 *                 example: 1
 *                 description: ID do vínculo turma-professor-disciplina
 *               idPeriodoLetivo:
 *                 type: integer
 *                 example: 1
 *                 description: ID do período letivo
 *               descricao:
 *                 type: string
 *                 example: "Prova 1 - Matemática"
 *                 description: Descrição da avaliação
 *               dataAvaliacao:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-15"
 *                 description: Data de aplicação da prova
 *               peso:
 *                 type: number
 *                 format: float
 *                 example: 1.0
 *                 default: 1.0
 *                 description: Peso da avaliação no cálculo da média
 *               arquivo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo PDF da prova (máximo 10MB)
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso
 *       400:
 *         description: Dados inválidos ou arquivo inválido
 *       404:
 *         description: Vínculo ou período não encontrado
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR', 'PROFESSOR'),
  uploadMiddleware.single('arquivo'),
  avaliacaoController.create.bind(avaliacaoController)
);

/**
 * @swagger
 * /avaliacoes/{id}:
 *   put:
 *     summary: Atualiza avaliação
 *     description: Atualiza os dados de uma avaliação existente, incluindo substituição do arquivo
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               idTurmaProfessor:
 *                 type: integer
 *               idPeriodoLetivo:
 *                 type: integer
 *               descricao:
 *                 type: string
 *               dataAvaliacao:
 *                 type: string
 *                 format: date
 *               peso:
 *                 type: number
 *                 format: float
 *               arquivo:
 *                 type: string
 *                 format: binary
 *                 description: Novo arquivo PDF (substitui o anterior)
 *     responses:
 *       200:
 *         description: Avaliação atualizada com sucesso
 *       404:
 *         description: Avaliação não encontrada
 */
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR', 'PROFESSOR'),
  uploadMiddleware.single('arquivo'),
  avaliacaoController.update.bind(avaliacaoController)
);

/**
 * @swagger
 * /avaliacoes/{id}:
 *   delete:
 *     summary: Remove avaliação
 *     description: Remove uma avaliação e todas as suas notas do sistema
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação
 *     responses:
 *       200:
 *         description: Avaliação removida com sucesso
 *       404:
 *         description: Avaliação não encontrada
 */
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  avaliacaoController.delete.bind(avaliacaoController)
);

/**
 * @swagger
 * /avaliacoes/{id}/arquivo:
 *   delete:
 *     summary: Remove arquivo da prova
 *     description: Remove apenas o arquivo PDF da prova, mantendo a avaliação
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da avaliação
 *     responses:
 *       200:
 *         description: Arquivo removido com sucesso
 *       404:
 *         description: Avaliação ou arquivo não encontrado
 */
router.delete(
  '/:id/arquivo',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR', 'PROFESSOR'),
  avaliacaoController.removeArquivo.bind(avaliacaoController)
);

export { router as avaliacaoRoutes };
