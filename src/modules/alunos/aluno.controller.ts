/**
 * ============================================
 * SIGEA Backend - Controller de Alunos
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { alunoService } from './aluno.service';
import { alunoSchema, alunoUpdateSchema } from './aluno.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

export class AlunoController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await alunoService.findAll(params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await alunoService.findById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findByMatricula(req: Request, res: Response, next: NextFunction) {
    try {
      const matricula = req.params['matricula'] ?? '';
      const result = await alunoService.findByMatricula(matricula);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = alunoSchema.parse(req.body);
      const result = await alunoService.create(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const data = alunoUpdateSchema.parse(req.body);
      const result = await alunoService.update(id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await alunoService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findNotas(req: Request, res: Response, next: NextFunction) {
    try {
      const idAluno = parseIntParam(req.params['id']);
      const result = await alunoService.findNotas(idAluno);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const alunoController = new AlunoController();

export default alunoController;
