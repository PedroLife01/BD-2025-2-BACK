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
      const result = await turmaService.findAll(params, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await turmaService.findById(id, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = turmaSchema.parse(req.body);
      const result = await turmaService.create(data, req.user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const data = turmaUpdateSchema.parse(req.body);
      const result = await turmaService.update(id, data, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await turmaService.delete(id, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findAlunos(req: Request, res: Response, next: NextFunction) {
    try {
      const idTurma = parseIntParam(req.params['id']);
      const params = paginationSchema.parse(req.query);
      const result = await turmaService.findAlunos(idTurma, params, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna as turmas do professor logado
   */
  async findMinhasTurmas(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.idProfessor) {
        res.status(403).json({
          success: false,
          message: 'Apenas professores podem acessar este recurso',
          error: 'FORBIDDEN',
        });
        return;
      }
      const params = paginationSchema.parse(req.query);
      const result = await turmaService.findMinhasTurmas(req.user.idProfessor, params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const turmaController = new TurmaController();

export default turmaController;
