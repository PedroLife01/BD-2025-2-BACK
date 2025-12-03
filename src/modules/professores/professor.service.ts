/**
 * ============================================
 * SIGEA Backend - Serviço de Professores
 * ============================================
 */

import { prisma } from '../../config';
import { ProfessorInput, ProfessorUpdateInput } from './professor.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

export class ProfessorService {
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where = params.search
      ? { nome: { contains: params.search, mode: 'insensitive' as const } }
      : {};

    const [professores, total] = await Promise.all([
      prisma.professor.findMany({
        where,
        skip,
        take,
        orderBy: { nome: params.order },
        include: { escola: true },
      }),
      prisma.professor.count({ where }),
    ]);

    return createPaginatedResponse(professores, total, params);
  }

  async findById(id: number) {
    const professor = await prisma.professor.findUnique({
      where: { id },
      include: {
        escola: true,
        turmasProfessores: {
          include: {
            turma: true,
            disciplina: true,
          },
        },
      },
    });

    if (!professor) {
      throw new AppError('Professor não encontrado', 404, 'PROFESSOR_NOT_FOUND');
    }

    return createSuccessResponse(professor);
  }

  async create(data: ProfessorInput) {
    // Verifica se escola existe
    const escola = await prisma.escola.findUnique({ where: { id: data.idEscola } });
    if (!escola) {
      throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
    }

    const professor = await prisma.professor.create({
      data: {
        idEscola: data.idEscola,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
      },
      include: { escola: true },
    });

    return createSuccessResponse(professor, 'Professor criado com sucesso');
  }

  async update(id: number, data: ProfessorUpdateInput) {
    await this.findById(id);

    if (data.idEscola) {
      const escola = await prisma.escola.findUnique({ where: { id: data.idEscola } });
      if (!escola) {
        throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
      }
    }

    const professor = await prisma.professor.update({
      where: { id },
      data: {
        idEscola: data.idEscola,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
      },
      include: { escola: true },
    });

    return createSuccessResponse(professor, 'Professor atualizado com sucesso');
  }

  async delete(id: number) {
    await this.findById(id);

    await prisma.professor.delete({ where: { id } });

    return createSuccessResponse(null, 'Professor removido com sucesso');
  }
}

export const professorService = new ProfessorService();

export default professorService;
