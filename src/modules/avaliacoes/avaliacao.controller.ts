/**
 * ============================================
 * SIGEA Backend - Controller de Avaliações
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { avaliacaoService } from './avaliacao.service';
import { avaliacaoSchema, avaliacaoUpdateSchema } from './avaliacao.dto';
import { paginationSchema, parseIntParam } from '../../shared/utils';

export class AvaliacaoController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const params = paginationSchema.parse(req.query);
      const result = await avaliacaoService.findAll(params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await avaliacaoService.findById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findByTurmaProfessor(req: Request, res: Response, next: NextFunction) {
    try {
      const idTurmaProfessor = parseIntParam(req.params['idTurmaProfessor']);
      const params = paginationSchema.parse(req.query);
      const result = await avaliacaoService.findByTurmaProfessor(idTurmaProfessor, params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = avaliacaoSchema.parse(req.body);
      const arquivoProva = req.file?.buffer;
      const result = await avaliacaoService.create(data, arquivoProva);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const data = avaliacaoUpdateSchema.parse(req.body);
      const arquivoProva = req.file?.buffer;
      const result = await avaliacaoService.update(id, data, arquivoProva);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await avaliacaoService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download do arquivo PDF da prova
   */
  async downloadArquivo(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const { buffer, filename } = await avaliacaoService.downloadArquivo(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove apenas o arquivo da prova
   */
  async removeArquivo(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params['id']);
      const result = await avaliacaoService.removeArquivo(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const avaliacaoController = new AvaliacaoController();

export default avaliacaoController;
