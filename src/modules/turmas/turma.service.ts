/**
 * ============================================
 * SIGEA Backend - Serviço de Turmas
 * ============================================
 */

import { prisma } from '../../config';
import { TurmaInput, TurmaUpdateInput } from './turma.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

export class TurmaService {
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where = params.search
      ? {
          OR: [
            { nome: { contains: params.search, mode: 'insensitive' as const } },
            { serie: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [turmas, total] = await Promise.all([
      prisma.turma.findMany({
        where,
        skip,
        take,
        orderBy: [{ anoLetivo: 'desc' }, { nome: params.order }],
        include: {
          escola: true,
          _count: {
            select: { alunos: true },
          },
        },
      }),
      prisma.turma.count({ where }),
    ]);

    return createPaginatedResponse(turmas, total, params);
  }

  async findById(id: number) {
    const turma = await prisma.turma.findUnique({
      where: { id },
      include: {
        escola: true,
        alunos: true,
        turmasProfessores: {
          include: {
            professor: true,
            disciplina: true,
          },
        },
      },
    });

    if (!turma) {
      throw new AppError('Turma não encontrada', 404, 'TURMA_NOT_FOUND');
    }

    return createSuccessResponse(turma);
  }

  async create(data: TurmaInput) {
    // Verifica se escola existe
    const escola = await prisma.escola.findUnique({ where: { id: data.idEscola } });
    if (!escola) {
      throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
    }

    const turma = await prisma.turma.create({
      data: {
        idEscola: data.idEscola,
        nome: data.nome,
        anoLetivo: data.anoLetivo,
        serie: data.serie,
        turno: data.turno,
      },
      include: { escola: true },
    });

    return createSuccessResponse(turma, 'Turma criada com sucesso');
  }

  async update(id: number, data: TurmaUpdateInput) {
    await this.findById(id);

    if (data.idEscola) {
      const escola = await prisma.escola.findUnique({ where: { id: data.idEscola } });
      if (!escola) {
        throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
      }
    }

    const turma = await prisma.turma.update({
      where: { id },
      data: {
        idEscola: data.idEscola,
        nome: data.nome,
        anoLetivo: data.anoLetivo,
        serie: data.serie,
        turno: data.turno,
      },
      include: { escola: true },
    });

    return createSuccessResponse(turma, 'Turma atualizada com sucesso');
  }

  async delete(id: number) {
    await this.findById(id);

    await prisma.turma.delete({ where: { id } });

    return createSuccessResponse(null, 'Turma removida com sucesso');
  }

  /**
   * Lista alunos de uma turma específica
   */
  async findAlunos(idTurma: number, params: PaginationParams) {
    await this.findById(idTurma);

    const { skip, take } = getPaginationParams(params);

    const where = { idTurma };

    const [alunos, total] = await Promise.all([
      prisma.aluno.findMany({
        where,
        skip,
        take,
        orderBy: { nome: params.order },
      }),
      prisma.aluno.count({ where }),
    ]);

    return createPaginatedResponse(alunos, total, params);
  }
}

export const turmaService = new TurmaService();

export default turmaService;
