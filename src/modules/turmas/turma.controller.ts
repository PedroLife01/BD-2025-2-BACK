/**
 * ============================================
 * SIGEA Backend - Controller de Turmas
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { turmaService } from './turma.service';
import { turmaSchema, turmaUpdateSchema } from './turma.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

export class TurmaController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await turmaService.findAll(params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await turmaService.findById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = turmaSchema.parse(req.body);
      const result = await turmaService.create(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const data = turmaUpdateSchema.parse(req.body);
      const result = await turmaService.update(id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await turmaService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findAlunos(req: Request, res: Response, next: NextFunction) {
    try {
      const idTurma = parseIntParam(req.params['id']);
      const params = paginationSchema.parse(req.query);
      const result = await turmaService.findAlunos(idTurma, params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const turmaController = new TurmaController();

export default turmaController;
