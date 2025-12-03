/**
 * ============================================
 * SIGEA Backend - Controller de Disciplinas
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { disciplinaService } from './disciplina.service';
import { disciplinaSchema, disciplinaUpdateSchema } from './disciplina.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

export class DisciplinaController {
  /**
   * @swagger
   * /api/disciplinas:
   *   get:
   *     tags: [Disciplinas]
   *     summary: Listar disciplinas
   *     parameters:
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
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de disciplinas
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await disciplinaService.findAll(params);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/disciplinas/{id}:
   *   get:
   *     tags: [Disciplinas]
   *     summary: Buscar disciplina por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Dados da disciplina
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await disciplinaService.findById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/disciplinas:
   *   post:
   *     tags: [Disciplinas]
   *     summary: Criar disciplina
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Disciplina'
   *     responses:
   *       201:
   *         description: Disciplina criada
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = disciplinaSchema.parse(req.body);
      const result = await disciplinaService.create(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/disciplinas/{id}:
   *   put:
   *     tags: [Disciplinas]
   *     summary: Atualizar disciplina
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Disciplina atualizada
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const data = disciplinaUpdateSchema.parse(req.body);
      const result = await disciplinaService.update(id, data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/disciplinas/{id}:
   *   delete:
   *     tags: [Disciplinas]
   *     summary: Remover disciplina
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Disciplina removida
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await disciplinaService.delete(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const disciplinaController = new DisciplinaController();

export default disciplinaController;
