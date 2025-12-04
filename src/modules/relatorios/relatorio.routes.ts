/**
 * ============================================
 * SIGEA Backend - Rotas de Relatórios
 * ============================================
 * 
 * Endpoints disponíveis:
 * - GET /api/relatorios/meu-boletim          → Boletim do aluno logado
 * - GET /api/relatorios/alunos/:idAluno      → Boletim de um aluno específico
 * - GET /api/relatorios/turmas/:idTurma      → Relatório de uma turma
 * - GET /api/relatorios/minha-escola         → Estatísticas da escola do coordenador
 * - GET /api/relatorios/escolas/:idEscola    → Estatísticas de uma escola específica
 */

import { Router } from 'express';
import { relatorioController } from './relatorio.controller';
import { authMiddleware, authorizeRoles } from '../../shared/middlewares';

const router = Router();

/**
 * @swagger
 * /relatorios/meu-boletim:
 *   get:
 *     summary: Boletim do aluno logado
 *     description: Retorna o boletim completo do aluno autenticado
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Boletim gerado com sucesso
 *       403:
 *         description: Apenas alunos podem acessar
 */
router.get(
  '/meu-boletim',
  authMiddleware,
  authorizeRoles('ALUNO'),
  relatorioController.getMeuBoletim.bind(relatorioController)
);

/**
 * @swagger
 * /relatorios/minha-escola:
 *   get:
 *     summary: Estatísticas da escola do coordenador
 *     description: Retorna estatísticas da escola do usuário logado
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas geradas com sucesso
 *       403:
 *         description: Usuário não vinculado a escola
 */
router.get(
  '/minha-escola',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  relatorioController.getMinhaEscola.bind(relatorioController)
);

/**
 * @swagger
 * /relatorios/alunos/{idAluno}:
 *   get:
 *     summary: Boletim de um aluno
 *     description: Retorna o boletim completo de um aluno específico
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAluno
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Boletim gerado com sucesso
 *       403:
 *         description: Sem permissão para acessar boletim
 *       404:
 *         description: Aluno não encontrado
 */
router.get(
  '/alunos/:idAluno',
  authMiddleware,
  relatorioController.getBoletimAluno.bind(relatorioController)
);

/**
 * @swagger
 * /relatorios/turmas/{idTurma}:
 *   get:
 *     summary: Relatório de uma turma
 *     description: Retorna relatório de desempenho de uma turma
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTurma
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da turma
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *       403:
 *         description: Sem permissão para acessar relatório
 *       404:
 *         description: Turma não encontrada
 */
router.get(
  '/turmas/:idTurma',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR', 'PROFESSOR'),
  relatorioController.getRelatorioTurma.bind(relatorioController)
);

/**
 * @swagger
 * /relatorios/escolas/{idEscola}:
 *   get:
 *     summary: Estatísticas de uma escola
 *     description: Retorna estatísticas gerais de uma escola específica
 *     tags: [Relatórios]
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
 *         description: Estatísticas geradas com sucesso
 *       403:
 *         description: Sem permissão para acessar estatísticas
 *       404:
 *         description: Escola não encontrada
 */
router.get(
  '/escolas/:idEscola',
  authMiddleware,
  authorizeRoles('ADMIN', 'COORDENADOR'),
  relatorioController.getEstatisticasEscola.bind(relatorioController)
);

export { router as relatorioRoutes };
