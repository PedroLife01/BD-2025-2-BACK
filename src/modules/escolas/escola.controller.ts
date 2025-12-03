/**
 * ============================================
 * SIGEA Backend - Controller de Escolas
 * ============================================
 * Handlers HTTP para endpoints de escolas
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { escolaService } from './escola.service';
import { escolaSchema, escolaUpdateSchema } from './escola.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

/**
 * Controller de escolas
 * Processa requisições HTTP e delega para o service
 */
export class EscolaController {
  /**
   * GET /api/escolas
   * Lista todas as escolas com paginação
   *
   * @swagger
   * /api/escolas:
   *   get:
   *     tags: [Escolas]
   *     summary: Listar escolas
   *     description: Retorna lista paginada de escolas
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
   *         description: Itens por página
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Buscar por nome ou região
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: asc
   *         description: Ordenação
   *     responses:
   *       200:
   *         description: Lista de escolas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedResponse'
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await escolaService.findAll(params);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/escolas/:id
   * Busca uma escola por ID
   *
   * @swagger
   * /api/escolas/{id}:
   *   get:
   *     tags: [Escolas]
   *     summary: Buscar escola por ID
   *     description: Retorna dados completos de uma escola
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da escola
   *     responses:
   *       200:
   *         description: Dados da escola
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Escola'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await escolaService.findById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/escolas
   * Cria uma nova escola
   *
   * @swagger
   * /api/escolas:
   *   post:
   *     tags: [Escolas]
   *     summary: Criar escola
   *     description: Cadastra uma nova escola no sistema
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EscolaInput'
   *     responses:
   *       201:
   *         description: Escola criada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/Escola'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = escolaSchema.parse(req.body);
      const result = await escolaService.create(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/escolas/:id
   * Atualiza uma escola existente
   *
   * @swagger
   * /api/escolas/{id}:
   *   put:
   *     tags: [Escolas]
   *     summary: Atualizar escola
   *     description: Atualiza dados de uma escola existente
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da escola
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EscolaInput'
   *     responses:
   *       200:
   *         description: Escola atualizada com sucesso
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const data = escolaUpdateSchema.parse(req.body);
      const result = await escolaService.update(id, data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/escolas/:id
   * Remove uma escola
   *
   * @swagger
   * /api/escolas/{id}:
   *   delete:
   *     tags: [Escolas]
   *     summary: Remover escola
   *     description: Remove uma escola do sistema (cascade em relacionamentos)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da escola
   *     responses:
   *       200:
   *         description: Escola removida com sucesso
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await escolaService.delete(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/escolas/:id/turmas
   * Lista turmas de uma escola
   *
   * @swagger
   * /api/escolas/{id}/turmas:
   *   get:
   *     tags: [Escolas]
   *     summary: Listar turmas da escola
   *     description: Retorna turmas vinculadas a uma escola
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da escola
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
   *         description: Lista de turmas
   */
  async findTurmas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idEscola = parseIntParam(req.params['id']);
      const params = paginationSchema.parse(req.query);
      const result = await escolaService.findTurmas(idEscola, params);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/escolas/:id/professores
   * Lista professores de uma escola
   *
   * @swagger
   * /api/escolas/{id}/professores:
   *   get:
   *     tags: [Escolas]
   *     summary: Listar professores da escola
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Lista de professores
   */
  async findProfessores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idEscola = parseIntParam(req.params['id']);
      const params = paginationSchema.parse(req.query);
      const result = await escolaService.findProfessores(idEscola, params);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/escolas/:id/coordenadores
   * Lista coordenadores de uma escola
   *
   * @swagger
   * /api/escolas/{id}/coordenadores:
   *   get:
   *     tags: [Escolas]
   *     summary: Listar coordenadores da escola
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Lista de coordenadores
   */
  async findCoordenadores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idEscola = parseIntParam(req.params['id']);
      const params = paginationSchema.parse(req.query);
      const result = await escolaService.findCoordenadores(idEscola, params);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

/**
 * Instância do controller
 */
export const escolaController = new EscolaController();

export default escolaController;
