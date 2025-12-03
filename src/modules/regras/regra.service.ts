/**
 * ============================================
 * SIGEA Backend - Serviço de Regras de Aprovação
 * ============================================
 * Gerencia as regras de aprovação definidas por coordenadores para cada escola
 */

import { prisma } from '../../config';
import { RegraAprovacaoInput, RegraAprovacaoUpdateInput } from './regra.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

export class RegraService {
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const [regras, total] = await Promise.all([
      prisma.regraAprovacao.findMany({
        skip,
        take,
        orderBy: { id: params.order },
        include: {
          escola: true,
          coordenador: true,
        },
      }),
      prisma.regraAprovacao.count(),
    ]);

    return createPaginatedResponse(regras, total, params);
  }

  async findById(id: number) {
    const regra = await prisma.regraAprovacao.findUnique({
      where: { id },
      include: {
        escola: true,
        coordenador: true,
      },
    });

    if (!regra) {
      throw new AppError('Regra de aprovação não encontrada', 404, 'REGRA_NOT_FOUND');
    }

    return createSuccessResponse(regra);
  }

  async findByEscola(idEscola: number) {
    const escola = await prisma.escola.findUnique({ where: { id: idEscola } });
    if (!escola) {
      throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
    }

    const regras = await prisma.regraAprovacao.findMany({
      where: { idEscola },
      include: {
        coordenador: true,
      },
      orderBy: { id: 'desc' },
    });

    return createSuccessResponse(regras);
  }

  async create(data: RegraAprovacaoInput) {
    // Valida escola
    const escola = await prisma.escola.findUnique({ where: { id: data.idEscola } });
    if (!escola) {
      throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
    }

    // Valida coordenador
    const coordenador = await prisma.coordenador.findUnique({ where: { id: data.idCoordenador } });
    if (!coordenador) {
      throw new AppError('Coordenador não encontrado', 404, 'COORDENADOR_NOT_FOUND');
    }

    // Valida que coordenador pertence à escola
    if (coordenador.idEscola !== data.idEscola) {
      throw new AppError(
        'O coordenador não pertence à escola informada',
        400,
        'COORDENADOR_ESCOLA_MISMATCH'
      );
    }

    const regra = await prisma.regraAprovacao.create({
      data: {
        idEscola: data.idEscola,
        idCoordenador: data.idCoordenador,
        anoLetivo: data.anoLetivo,
        mediaMinima: data.mediaMinima,
      },
      include: {
        escola: true,
        coordenador: true,
      },
    });

    return createSuccessResponse(regra, 'Regra de aprovação criada com sucesso');
  }

  async update(id: number, data: RegraAprovacaoUpdateInput) {
    const regraExistente = await prisma.regraAprovacao.findUnique({ where: { id } });
    if (!regraExistente) {
      throw new AppError('Regra de aprovação não encontrada', 404, 'REGRA_NOT_FOUND');
    }

    // Valida escola se fornecida
    if (data.idEscola) {
      const escola = await prisma.escola.findUnique({ where: { id: data.idEscola } });
      if (!escola) {
        throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
      }
    }

    // Valida coordenador se fornecido
    if (data.idCoordenador) {
      const coordenador = await prisma.coordenador.findUnique({ where: { id: data.idCoordenador } });
      if (!coordenador) {
        throw new AppError('Coordenador não encontrado', 404, 'COORDENADOR_NOT_FOUND');
      }

      // Valida que coordenador pertence à escola (considerando escola atual ou nova)
      const idEscolaFinal = data.idEscola || regraExistente.idEscola;
      if (coordenador.idEscola !== idEscolaFinal) {
        throw new AppError(
          'O coordenador não pertence à escola informada',
          400,
          'COORDENADOR_ESCOLA_MISMATCH'
        );
      }
    }

    const regra = await prisma.regraAprovacao.update({
      where: { id },
      data: {
        idEscola: data.idEscola,
        idCoordenador: data.idCoordenador,
        anoLetivo: data.anoLetivo,
        mediaMinima: data.mediaMinima,
      },
      include: {
        escola: true,
        coordenador: true,
      },
    });

    return createSuccessResponse(regra, 'Regra de aprovação atualizada com sucesso');
  }

  async delete(id: number) {
    const regra = await prisma.regraAprovacao.findUnique({ where: { id } });
    if (!regra) {
      throw new AppError('Regra de aprovação não encontrada', 404, 'REGRA_NOT_FOUND');
    }

    await prisma.regraAprovacao.delete({ where: { id } });

    return createSuccessResponse(null, 'Regra de aprovação removida com sucesso');
  }
}

export const regraService = new RegraService();

export default regraService;
