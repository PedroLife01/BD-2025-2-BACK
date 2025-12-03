/**
 * ============================================
 * SIGEA Backend - Serviço de Coordenadores
 * ============================================
 */

import { prisma } from '../../config';
import { CoordenadorInput, CoordenadorUpdateInput } from './coordenador.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

export class CoordenadorService {
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where = params.search
      ? { nome: { contains: params.search, mode: 'insensitive' as const } }
      : {};

    const [coordenadores, total] = await Promise.all([
      prisma.coordenador.findMany({
        where,
        skip,
        take,
        orderBy: { nome: params.order },
        include: { escola: true },
      }),
      prisma.coordenador.count({ where }),
    ]);

    return createPaginatedResponse(coordenadores, total, params);
  }

  async findById(id: number) {
    const coordenador = await prisma.coordenador.findUnique({
      where: { id },
      include: {
        escola: true,
        regrasAprovacao: true,
      },
    });

    if (!coordenador) {
      throw new AppError('Coordenador não encontrado', 404, 'COORDENADOR_NOT_FOUND');
    }

    return createSuccessResponse(coordenador);
  }

  async create(data: CoordenadorInput) {
    // Verifica se escola existe
    const escola = await prisma.escola.findUnique({ where: { id: data.idEscola } });
    if (!escola) {
      throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
    }

    const coordenador = await prisma.coordenador.create({
      data: {
        idEscola: data.idEscola,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
      },
      include: { escola: true },
    });

    return createSuccessResponse(coordenador, 'Coordenador criado com sucesso');
  }

  async update(id: number, data: CoordenadorUpdateInput) {
    await this.findById(id);

    if (data.idEscola) {
      const escola = await prisma.escola.findUnique({ where: { id: data.idEscola } });
      if (!escola) {
        throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
      }
    }

    const coordenador = await prisma.coordenador.update({
      where: { id },
      data: {
        idEscola: data.idEscola,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
      },
      include: { escola: true },
    });

    return createSuccessResponse(coordenador, 'Coordenador atualizado com sucesso');
  }

  async delete(id: number) {
    await this.findById(id);

    await prisma.coordenador.delete({ where: { id } });

    return createSuccessResponse(null, 'Coordenador removido com sucesso');
  }
}

export const coordenadorService = new CoordenadorService();

export default coordenadorService;
