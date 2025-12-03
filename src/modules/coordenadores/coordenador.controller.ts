/**
 * ============================================
 * SIGEA Backend - Controller de Coordenadores
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { coordenadorService } from './coordenador.service';
import { coordenadorSchema, coordenadorUpdateSchema } from './coordenador.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

export class CoordenadorController {
  /**
   * @swagger
   * /api/coordenadores:
   *   get:
   *     tags: [Coordenadores]
   *     summary: Listar coordenadores
   *     responses:
   *       200:
   *         description: Lista de coordenadores
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await coordenadorService.findAll(params);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/coordenadores/{id}:
   *   get:
   *     tags: [Coordenadores]
   *     summary: Buscar coordenador por ID
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await coordenadorService.findById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/coordenadores:
   *   post:
   *     tags: [Coordenadores]
   *     summary: Criar coordenador
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = coordenadorSchema.parse(req.body);
      const result = await coordenadorService.create(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/coordenadores/{id}:
   *   put:
   *     tags: [Coordenadores]
   *     summary: Atualizar coordenador
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const data = coordenadorUpdateSchema.parse(req.body);
      const result = await coordenadorService.update(id, data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/coordenadores/{id}:
   *   delete:
   *     tags: [Coordenadores]
   *     summary: Remover coordenador
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await coordenadorService.delete(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const coordenadorController = new CoordenadorController();

export default coordenadorController;
