/**
 * ============================================
 * SIGEA Backend - Serviço de Períodos Letivos
 * ============================================
 */

import { prisma } from '../../config';
import { PeriodoLetivoInput, PeriodoLetivoUpdateInput } from './periodo.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

export class PeriodoService {
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where = params.search
      ? {
          etapa: { contains: params.search, mode: 'insensitive' as const },
        }
      : {};

    const [periodos, total] = await Promise.all([
      prisma.periodoLetivo.findMany({
        where,
        skip,
        take,
        orderBy: [{ ano: 'desc' }, { etapa: params.order }],
      }),
      prisma.periodoLetivo.count({ where }),
    ]);

    return createPaginatedResponse(periodos, total, params);
  }

  async findById(id: number) {
    const periodo = await prisma.periodoLetivo.findUnique({
      where: { id },
      include: {
        avaliacoes: {
          include: {
            turmaProfessor: {
              include: {
                turma: true,
                disciplina: true,
              },
            },
          },
        },
      },
    });

    if (!periodo) {
      throw new AppError('Período letivo não encontrado', 404, 'PERIODO_NOT_FOUND');
    }

    return createSuccessResponse(periodo);
  }

  async create(data: PeriodoLetivoInput) {
    const periodo = await prisma.periodoLetivo.create({
      data: {
        ano: data.ano,
        etapa: data.etapa,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
      },
    });

    return createSuccessResponse(periodo, 'Período letivo criado com sucesso');
  }

  async update(id: number, data: PeriodoLetivoUpdateInput) {
    await this.findById(id);

    const periodo = await prisma.periodoLetivo.update({
      where: { id },
      data: {
        ano: data.ano,
        etapa: data.etapa,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
      },
    });

    return createSuccessResponse(periodo, 'Período letivo atualizado com sucesso');
  }

  async delete(id: number) {
    await this.findById(id);

    await prisma.periodoLetivo.delete({
      where: { id },
    });

    return createSuccessResponse(null, 'Período letivo removido com sucesso');
  }
}

export const periodoService = new PeriodoService();

export default periodoService;
