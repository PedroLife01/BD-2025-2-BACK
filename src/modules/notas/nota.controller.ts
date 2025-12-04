/**
 * ============================================
 * SIGEA Backend - Controller de Notas
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { notaService } from './nota.service';
import { notaSchema, notaUpdateSchema, notasBatchSchema } from './nota.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

export class NotaController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await notaService.findAll(params, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await notaService.findById(id, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findByAvaliacao(req: Request, res: Response, next: NextFunction) {
    try {
      const idAvaliacao = parseIntParam(req.params['idAvaliacao']);
      const params = paginationSchema.parse(req.query);
      const result = await notaService.findByAvaliacao(idAvaliacao, params, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findByAluno(req: Request, res: Response, next: NextFunction) {
    try {
      const idAluno = parseIntParam(req.params['idAluno']);
      const params = paginationSchema.parse(req.query);
      const result = await notaService.findByAluno(idAluno, params, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna as notas do aluno logado
   */
  async findMinhasNotas(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.idAluno) {
        res.status(403).json({
          success: false,
          message: 'Apenas alunos podem acessar este recurso',
          error: 'FORBIDDEN',
        });
        return;
      }
      const params = paginationSchema.parse(req.query);
      const result = await notaService.findMinhasNotas(req.user.idAluno, params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = notaSchema.parse(req.body);
      const result = await notaService.create(data, req.user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = notasBatchSchema.parse(req.body);
      const result = await notaService.createBatch(data, req.user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const data = notaUpdateSchema.parse(req.body);
      const result = await notaService.update(id, data, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await notaService.delete(id, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const notaController = new NotaController();

export default notaController;
