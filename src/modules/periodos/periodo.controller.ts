/**
 * ============================================
 * SIGEA Backend - Controller de Períodos Letivos
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { periodoService } from './periodo.service';
import { periodoLetivoSchema, periodoLetivoUpdateSchema } from './periodo.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

export class PeriodoController {
  /**
   * @swagger
   * /api/periodos:
   *   get:
   *     tags: [Períodos]
   *     summary: Listar períodos letivos
   *     responses:
   *       200:
   *         description: Lista de períodos
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await periodoService.findAll(params);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/periodos/{id}:
   *   get:
   *     tags: [Períodos]
   *     summary: Buscar período por ID
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await periodoService.findById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/periodos:
   *   post:
   *     tags: [Períodos]
   *     summary: Criar período letivo
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = periodoLetivoSchema.parse(req.body);
      const result = await periodoService.create(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/periodos/{id}:
   *   put:
   *     tags: [Períodos]
   *     summary: Atualizar período letivo
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const data = periodoLetivoUpdateSchema.parse(req.body);
      const result = await periodoService.update(id, data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/periodos/{id}:
   *   delete:
   *     tags: [Períodos]
   *     summary: Remover período letivo
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await periodoService.delete(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const periodoController = new PeriodoController();

export default periodoController;
