/**
 * ============================================
 * SIGEA Backend - Controller de Professores
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { professorService } from './professor.service';
import { professorSchema, professorUpdateSchema } from './professor.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

export class ProfessorController {
  /**
   * @swagger
   * /api/professores:
   *   get:
   *     tags: [Professores]
   *     summary: Listar professores
   *     responses:
   *       200:
   *         description: Lista de professores
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await professorService.findAll(params);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/professores/{id}:
   *   get:
   *     tags: [Professores]
   *     summary: Buscar professor por ID
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await professorService.findById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/professores:
   *   post:
   *     tags: [Professores]
   *     summary: Criar professor
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = professorSchema.parse(req.body);
      const result = await professorService.create(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/professores/{id}:
   *   put:
   *     tags: [Professores]
   *     summary: Atualizar professor
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const data = professorUpdateSchema.parse(req.body);
      const result = await professorService.update(id, data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/professores/{id}:
   *   delete:
   *     tags: [Professores]
   *     summary: Remover professor
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await professorService.delete(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const professorController = new ProfessorController();

export default professorController;
