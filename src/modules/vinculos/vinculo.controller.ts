/**
 * ============================================
 * SIGEA Backend - Controller de Vínculos
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { vinculoService } from './vinculo.service';
import { turmaProfessorSchema, turmaProfessorUpdateSchema } from './vinculo.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

export class VinculoController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await vinculoService.findAll(params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await vinculoService.findById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findByProfessor(req: Request, res: Response, next: NextFunction) {
    try {
      const idProfessor = parseIntParam(req.params['idProfessor']);
      const params = paginationSchema.parse(req.query);
      const result = await vinculoService.findByProfessor(idProfessor, params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findByTurma(req: Request, res: Response, next: NextFunction) {
    try {
      const idTurma = parseIntParam(req.params['idTurma']);
      const params = paginationSchema.parse(req.query);
      const result = await vinculoService.findByTurma(idTurma, params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = turmaProfessorSchema.parse(req.body);
      const result = await vinculoService.create(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const data = turmaProfessorUpdateSchema.parse(req.body);
      const result = await vinculoService.update(id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await vinculoService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const vinculoController = new VinculoController();

export default vinculoController;
