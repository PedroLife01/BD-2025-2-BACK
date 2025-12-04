/**
 * ============================================
 * SIGEA Backend - Controller de Relatórios
 * ============================================
 */

import { Request, Response, NextFunction } from 'express';
import { relatorioService } from './relatorio.service';
import { parseIntParam } from '../../shared/utils';

export class RelatorioController {
  /**
   * Gera boletim de um aluno específico
   */
  async getBoletimAluno(req: Request, res: Response, next: NextFunction) {
    try {
      const idAluno = parseIntParam(req.params['idAluno']);
      const result = await relatorioService.getBoletimAluno(idAluno, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gera boletim do aluno logado
   */
  async getMeuBoletim(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.idAluno) {
        res.status(403).json({
          success: false,
          message: 'Apenas alunos podem acessar este recurso',
          error: 'FORBIDDEN',
        });
        return;
      }
      const result = await relatorioService.getMeuBoletim(req.user.idAluno);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gera relatório de uma turma
   */
  async getRelatorioTurma(req: Request, res: Response, next: NextFunction) {
    try {
      const idTurma = parseIntParam(req.params['idTurma']);
      const result = await relatorioService.getRelatorioTurma(idTurma, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gera estatísticas de uma escola
   */
  async getEstatisticasEscola(req: Request, res: Response, next: NextFunction) {
    try {
      const idEscola = parseIntParam(req.params['idEscola']);
      const result = await relatorioService.getEstatisticasEscola(idEscola, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gera estatísticas da escola do coordenador logado
   */
  async getMinhaEscola(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.idEscola) {
        res.status(403).json({
          success: false,
          message: 'Usuário não está vinculado a nenhuma escola',
          error: 'FORBIDDEN',
        });
        return;
      }
      const result = await relatorioService.getEstatisticasEscola(req.user.idEscola, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const relatorioController = new RelatorioController();

export default relatorioController;
