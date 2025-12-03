/**
 * ============================================
 * SIGEA Backend - Controller de Regras de Aprovação
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { regraService } from './regra.service';
import { regraAprovacaoSchema, regraAprovacaoUpdateSchema } from './regra.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

export class RegraController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await regraService.findAll(params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await regraService.findById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findByEscola(req: Request, res: Response, next: NextFunction) {
    try {
      const idEscola = parseIntParam(req.params['idEscola']);
      const result = await regraService.findByEscola(idEscola);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = regraAprovacaoSchema.parse(req.body);
      const result = await regraService.create(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const data = regraAprovacaoUpdateSchema.parse(req.body);
      const result = await regraService.update(id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await regraService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const regraController = new RegraController();

export default regraController;
