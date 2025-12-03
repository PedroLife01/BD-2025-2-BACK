/**
 * ============================================
 * SIGEA Backend - Serviço de Alunos
 * ============================================
 */

import { prisma } from '../../config';
import { AlunoInput, AlunoUpdateInput } from './aluno.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

export class AlunoService {
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where = params.search
      ? {
          OR: [
            { nome: { contains: params.search, mode: 'insensitive' as const } },
            { matricula: { contains: params.search, mode: 'insensitive' as const } },
            { email: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [alunos, total] = await Promise.all([
      prisma.aluno.findMany({
        where,
        skip,
        take,
        orderBy: { nome: params.order },
        include: {
          turma: {
            include: { escola: true },
          },
        },
      }),
      prisma.aluno.count({ where }),
    ]);

    return createPaginatedResponse(alunos, total, params);
  }

  async findById(id: number) {
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        turma: {
          include: { escola: true },
        },
        notas: {
          include: {
            avaliacao: {
              include: {
                turmaProfessor: {
                  include: {
                    disciplina: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!aluno) {
      throw new AppError('Aluno não encontrado', 404, 'ALUNO_NOT_FOUND');
    }

    return createSuccessResponse(aluno);
  }

  async findByMatricula(matricula: string) {
    const aluno = await prisma.aluno.findUnique({
      where: { matricula },
      include: {
        turma: {
          include: { escola: true },
        },
      },
    });

    if (!aluno) {
      throw new AppError('Aluno não encontrado', 404, 'ALUNO_NOT_FOUND');
    }

    return createSuccessResponse(aluno);
  }

  async create(data: AlunoInput) {
    // Verifica se turma existe
    const turma = await prisma.turma.findUnique({ where: { id: data.idTurma } });
    if (!turma) {
      throw new AppError('Turma não encontrada', 404, 'TURMA_NOT_FOUND');
    }

    // Verifica se matrícula já existe
    const existingMatricula = await prisma.aluno.findUnique({ where: { matricula: data.matricula } });
    if (existingMatricula) {
      throw new AppError('Matrícula já cadastrada', 409, 'MATRICULA_EXISTS');
    }

    const aluno = await prisma.aluno.create({
      data: {
        idTurma: data.idTurma,
        nome: data.nome,
        matricula: data.matricula,
        dataNascimento: data.dataNascimento,
        email: data.email,
        telefoneResponsavel: data.telefoneResponsavel,
      },
      include: {
        turma: {
          include: { escola: true },
        },
      },
    });

    return createSuccessResponse(aluno, 'Aluno cadastrado com sucesso');
  }

  async update(id: number, data: AlunoUpdateInput) {
    const alunoExistente = await prisma.aluno.findUnique({ where: { id } });
    if (!alunoExistente) {
      throw new AppError('Aluno não encontrado', 404, 'ALUNO_NOT_FOUND');
    }

    if (data.idTurma) {
      const turma = await prisma.turma.findUnique({ where: { id: data.idTurma } });
      if (!turma) {
        throw new AppError('Turma não encontrada', 404, 'TURMA_NOT_FOUND');
      }
    }

    if (data.matricula && data.matricula !== alunoExistente.matricula) {
      const existingMatricula = await prisma.aluno.findUnique({ where: { matricula: data.matricula } });
      if (existingMatricula) {
        throw new AppError('Matrícula já cadastrada', 409, 'MATRICULA_EXISTS');
      }
    }

    const aluno = await prisma.aluno.update({
      where: { id },
      data: {
        idTurma: data.idTurma,
        nome: data.nome,
        matricula: data.matricula,
        dataNascimento: data.dataNascimento,
        email: data.email,
        telefoneResponsavel: data.telefoneResponsavel,
      },
      include: {
        turma: {
          include: { escola: true },
        },
      },
    });

    return createSuccessResponse(aluno, 'Aluno atualizado com sucesso');
  }

  async delete(id: number) {
    const aluno = await prisma.aluno.findUnique({ where: { id } });
    if (!aluno) {
      throw new AppError('Aluno não encontrado', 404, 'ALUNO_NOT_FOUND');
    }

    await prisma.aluno.delete({ where: { id } });

    return createSuccessResponse(null, 'Aluno removido com sucesso');
  }

  /**
   * Lista notas de um aluno específico
   */
  async findNotas(idAluno: number) {
    const aluno = await prisma.aluno.findUnique({ where: { id: idAluno } });
    if (!aluno) {
      throw new AppError('Aluno não encontrado', 404, 'ALUNO_NOT_FOUND');
    }

    const notas = await prisma.nota.findMany({
      where: { idAluno },
      include: {
        avaliacao: {
          include: {
            turmaProfessor: {
              include: {
                disciplina: true,
                professor: true,
              },
            },
            periodoLetivo: true,
          },
        },
      },
      orderBy: {
        avaliacao: {
          dataAplicacao: 'desc',
        },
      },
    });

    return createSuccessResponse(notas);
  }
}

export const alunoService = new AlunoService();

export default alunoService;
