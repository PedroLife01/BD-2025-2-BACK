/**
 * ============================================
 * SIGEA Backend - Serviço de Disciplinas
 * ============================================
 */

import { prisma } from '../../config';
import { DisciplinaInput, DisciplinaUpdateInput } from './disciplina.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

export class DisciplinaService {
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where = params.search
      ? {
          OR: [
            { nome: { contains: params.search, mode: 'insensitive' as const } },
            { areaConhecimento: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [disciplinas, total] = await Promise.all([
      prisma.disciplina.findMany({
        where,
        skip,
        take,
        orderBy: { nome: params.order },
      }),
      prisma.disciplina.count({ where }),
    ]);

    return createPaginatedResponse(disciplinas, total, params);
  }

  async findById(id: number) {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id },
      include: {
        turmasProfessores: {
          include: {
            turma: true,
            professor: true,
          },
        },
      },
    });

    if (!disciplina) {
      throw new AppError('Disciplina não encontrada', 404, 'DISCIPLINA_NOT_FOUND');
    }

    return createSuccessResponse(disciplina);
  }

  async create(data: DisciplinaInput) {
    const disciplina = await prisma.disciplina.create({
      data: {
        nome: data.nome,
        cargaHoraria: data.cargaHoraria,
        areaConhecimento: data.areaConhecimento,
      },
    });

    return createSuccessResponse(disciplina, 'Disciplina criada com sucesso');
  }

  async update(id: number, data: DisciplinaUpdateInput) {
    await this.findById(id);

    const disciplina = await prisma.disciplina.update({
      where: { id },
      data: {
        nome: data.nome,
        cargaHoraria: data.cargaHoraria,
        areaConhecimento: data.areaConhecimento,
      },
    });

    return createSuccessResponse(disciplina, 'Disciplina atualizada com sucesso');
  }

  async delete(id: number) {
    await this.findById(id);

    await prisma.disciplina.delete({
      where: { id },
    });

    return createSuccessResponse(null, 'Disciplina removida com sucesso');
  }
}

export const disciplinaService = new DisciplinaService();

export default disciplinaService;
