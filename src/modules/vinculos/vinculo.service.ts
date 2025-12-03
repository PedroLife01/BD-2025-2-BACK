/**
 * ============================================
 * SIGEA Backend - Serviço de Vínculos (Turma-Professor-Disciplina)
 * ============================================
 * Gerencia os vínculos entre turmas, professores e disciplinas
 */

import { prisma } from '../../config';
import { TurmaProfessorInput, TurmaProfessorUpdateInput } from './vinculo.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

export class VinculoService {
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const [vinculos, total] = await Promise.all([
      prisma.turmaProfessor.findMany({
        skip,
        take,
        orderBy: { id: params.order },
        include: {
          turma: {
            include: { escola: true },
          },
          professor: true,
          disciplina: true,
        },
      }),
      prisma.turmaProfessor.count(),
    ]);

    return createPaginatedResponse(vinculos, total, params);
  }

  async findById(id: number) {
    const vinculo = await prisma.turmaProfessor.findUnique({
      where: { id },
      include: {
        turma: {
          include: { escola: true },
        },
        professor: true,
        disciplina: true,
        avaliacoes: {
          include: { periodoLetivo: true },
        },
      },
    });

    if (!vinculo) {
      throw new AppError('Vínculo não encontrado', 404, 'VINCULO_NOT_FOUND');
    }

    return createSuccessResponse(vinculo);
  }

  async findByProfessor(idProfessor: number, params: PaginationParams) {
    const professor = await prisma.professor.findUnique({ where: { id: idProfessor } });
    if (!professor) {
      throw new AppError('Professor não encontrado', 404, 'PROFESSOR_NOT_FOUND');
    }

    const { skip, take } = getPaginationParams(params);

    const where = { idProfessor };

    const [vinculos, total] = await Promise.all([
      prisma.turmaProfessor.findMany({
        where,
        skip,
        take,
        include: {
          turma: {
            include: { escola: true },
          },
          disciplina: true,
        },
      }),
      prisma.turmaProfessor.count({ where }),
    ]);

    return createPaginatedResponse(vinculos, total, params);
  }

  async findByTurma(idTurma: number, params: PaginationParams) {
    const turma = await prisma.turma.findUnique({ where: { id: idTurma } });
    if (!turma) {
      throw new AppError('Turma não encontrada', 404, 'TURMA_NOT_FOUND');
    }

    const { skip, take } = getPaginationParams(params);

    const where = { idTurma };

    const [vinculos, total] = await Promise.all([
      prisma.turmaProfessor.findMany({
        where,
        skip,
        take,
        include: {
          professor: true,
          disciplina: true,
        },
      }),
      prisma.turmaProfessor.count({ where }),
    ]);

    return createPaginatedResponse(vinculos, total, params);
  }

  async create(data: TurmaProfessorInput) {
    // Valida turma
    const turma = await prisma.turma.findUnique({ where: { id: data.idTurma } });
    if (!turma) {
      throw new AppError('Turma não encontrada', 404, 'TURMA_NOT_FOUND');
    }

    // Valida professor
    const professor = await prisma.professor.findUnique({ where: { id: data.idProfessor } });
    if (!professor) {
      throw new AppError('Professor não encontrado', 404, 'PROFESSOR_NOT_FOUND');
    }

    // Valida disciplina
    const disciplina = await prisma.disciplina.findUnique({ where: { id: data.idDisciplina } });
    if (!disciplina) {
      throw new AppError('Disciplina não encontrada', 404, 'DISCIPLINA_NOT_FOUND');
    }

    // Verifica se vínculo já existe (mesmo professor, mesma turma, mesma disciplina)
    const existingVinculo = await prisma.turmaProfessor.findFirst({
      where: {
        idTurma: data.idTurma,
        idProfessor: data.idProfessor,
        idDisciplina: data.idDisciplina,
      },
    });

    if (existingVinculo) {
      throw new AppError('Este vínculo já existe', 409, 'VINCULO_EXISTS');
    }

    const vinculo = await prisma.turmaProfessor.create({
      data: {
        idTurma: data.idTurma,
        idProfessor: data.idProfessor,
        idDisciplina: data.idDisciplina,
      },
      include: {
        turma: {
          include: { escola: true },
        },
        professor: true,
        disciplina: true,
      },
    });

    return createSuccessResponse(vinculo, 'Vínculo criado com sucesso');
  }

  async update(id: number, data: TurmaProfessorUpdateInput) {
    const vinculoExistente = await prisma.turmaProfessor.findUnique({ where: { id } });
    if (!vinculoExistente) {
      throw new AppError('Vínculo não encontrado', 404, 'VINCULO_NOT_FOUND');
    }

    // Valida turma se fornecida
    if (data.idTurma) {
      const turma = await prisma.turma.findUnique({ where: { id: data.idTurma } });
      if (!turma) {
        throw new AppError('Turma não encontrada', 404, 'TURMA_NOT_FOUND');
      }
    }

    // Valida professor se fornecido
    if (data.idProfessor) {
      const professor = await prisma.professor.findUnique({ where: { id: data.idProfessor } });
      if (!professor) {
        throw new AppError('Professor não encontrado', 404, 'PROFESSOR_NOT_FOUND');
      }
    }

    // Valida disciplina se fornecida
    if (data.idDisciplina) {
      const disciplina = await prisma.disciplina.findUnique({ where: { id: data.idDisciplina } });
      if (!disciplina) {
        throw new AppError('Disciplina não encontrada', 404, 'DISCIPLINA_NOT_FOUND');
      }
    }

    const vinculo = await prisma.turmaProfessor.update({
      where: { id },
      data: {
        idTurma: data.idTurma,
        idProfessor: data.idProfessor,
        idDisciplina: data.idDisciplina,
      },
      include: {
        turma: {
          include: { escola: true },
        },
        professor: true,
        disciplina: true,
      },
    });

    return createSuccessResponse(vinculo, 'Vínculo atualizado com sucesso');
  }

  async delete(id: number) {
    const vinculo = await prisma.turmaProfessor.findUnique({ where: { id } });
    if (!vinculo) {
      throw new AppError('Vínculo não encontrado', 404, 'VINCULO_NOT_FOUND');
    }

    await prisma.turmaProfessor.delete({ where: { id } });

    return createSuccessResponse(null, 'Vínculo removido com sucesso');
  }
}

export const vinculoService = new VinculoService();

export default vinculoService;
