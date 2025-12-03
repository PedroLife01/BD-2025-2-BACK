/**
 * ============================================
 * SIGEA Backend - Serviço de Notas
 * ============================================
 * Gerencia as notas dos alunos em avaliações
 */

import { prisma } from '../../config';
import { NotaInput, NotaUpdateInput, NotasBatchInput } from './nota.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

export class NotaService {
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const [notas, total] = await Promise.all([
      prisma.nota.findMany({
        skip,
        take,
        orderBy: { id: params.order },
        include: {
          aluno: true,
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
      }),
      prisma.nota.count(),
    ]);

    return createPaginatedResponse(notas, total, params);
  }

  async findById(id: number) {
    const nota = await prisma.nota.findUnique({
      where: { id },
      include: {
        aluno: {
          include: { turma: true },
        },
        avaliacao: {
          include: {
            turmaProfessor: {
              include: {
                professor: true,
                disciplina: true,
              },
            },
            periodoLetivo: true,
          },
        },
      },
    });

    if (!nota) {
      throw new AppError('Nota não encontrada', 404, 'NOTA_NOT_FOUND');
    }

    return createSuccessResponse(nota);
  }

  async findByAvaliacao(idAvaliacao: number, params: PaginationParams) {
    const avaliacao = await prisma.avaliacao.findUnique({ where: { id: idAvaliacao } });
    if (!avaliacao) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    const { skip, take } = getPaginationParams(params);

    const where = { idAvaliacao };

    const [notas, total] = await Promise.all([
      prisma.nota.findMany({
        where,
        skip,
        take,
        orderBy: { aluno: { nome: params.order } },
        include: {
          aluno: true,
        },
      }),
      prisma.nota.count({ where }),
    ]);

    return createPaginatedResponse(notas, total, params);
  }

  async findByAluno(idAluno: number, params: PaginationParams) {
    const aluno = await prisma.aluno.findUnique({ where: { id: idAluno } });
    if (!aluno) {
      throw new AppError('Aluno não encontrado', 404, 'ALUNO_NOT_FOUND');
    }

    const { skip, take } = getPaginationParams(params);

    const where = { idAluno };

    const [notas, total] = await Promise.all([
      prisma.nota.findMany({
        where,
        skip,
        take,
        orderBy: { avaliacao: { dataAplicacao: 'desc' } },
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
      }),
      prisma.nota.count({ where }),
    ]);

    return createPaginatedResponse(notas, total, params);
  }

  async create(data: NotaInput) {
    // Valida avaliação
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: data.idAvaliacao },
      include: { turmaProfessor: true },
    });
    if (!avaliacao) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    // Valida aluno
    const aluno = await prisma.aluno.findUnique({ where: { id: data.idAluno } });
    if (!aluno) {
      throw new AppError('Aluno não encontrado', 404, 'ALUNO_NOT_FOUND');
    }

    // Verifica se aluno pertence à turma da avaliação
    if (aluno.idTurma !== avaliacao.turmaProfessor.idTurma) {
      throw new AppError(
        'O aluno não pertence à turma desta avaliação',
        400,
        'ALUNO_TURMA_MISMATCH'
      );
    }

    // Verifica se já existe nota para este aluno nesta avaliação
    const existingNota = await prisma.nota.findFirst({
      where: {
        idAvaliacao: data.idAvaliacao,
        idAluno: data.idAluno,
      },
    });

    if (existingNota) {
      throw new AppError(
        'Já existe uma nota cadastrada para este aluno nesta avaliação',
        409,
        'NOTA_EXISTS'
      );
    }

    const nota = await prisma.nota.create({
      data: {
        idAvaliacao: data.idAvaliacao,
        idAluno: data.idAluno,
        notaObtida: data.notaObtida,
      },
      include: {
        aluno: true,
        avaliacao: {
          include: {
            turmaProfessor: {
              include: { disciplina: true },
            },
          },
        },
      },
    });

    return createSuccessResponse(nota, 'Nota cadastrada com sucesso');
  }

  /**
   * Lançamento de múltiplas notas de uma vez
   */
  async createBatch(data: NotasBatchInput) {
    // Valida avaliação
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: data.idAvaliacao },
      include: { turmaProfessor: true },
    });
    if (!avaliacao) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    // Valida todos os alunos
    const alunoIds = data.notas.map((n) => n.idAluno);
    const alunos = await prisma.aluno.findMany({
      where: { id: { in: alunoIds } },
    });

    if (alunos.length !== alunoIds.length) {
      throw new AppError('Um ou mais alunos não foram encontrados', 404, 'ALUNOS_NOT_FOUND');
    }

    // Verifica se todos os alunos pertencem à turma
    const alunosForaTurma = alunos.filter(
      (a: { idTurma: number; nome: string }) => a.idTurma !== avaliacao.turmaProfessor.idTurma
    );
    if (alunosForaTurma.length > 0) {
      throw new AppError(
        `Os seguintes alunos não pertencem à turma: ${alunosForaTurma.map((a: { nome: string }) => a.nome).join(', ')}`,
        400,
        'ALUNOS_TURMA_MISMATCH'
      );
    }

    // Verifica notas já existentes
    const existingNotas = await prisma.nota.findMany({
      where: {
        idAvaliacao: data.idAvaliacao,
        idAluno: { in: alunoIds },
      },
    });

    if (existingNotas.length > 0) {
      throw new AppError(
        `Já existem notas cadastradas para ${existingNotas.length} aluno(s) nesta avaliação`,
        409,
        'NOTAS_EXIST'
      );
    }

    // Cria todas as notas em uma transação
    const notas = await prisma.$transaction(
      data.notas.map((n) =>
        prisma.nota.create({
          data: {
            idAvaliacao: data.idAvaliacao,
            idAluno: n.idAluno,
            notaObtida: n.notaObtida,
          },
          include: {
            aluno: true,
          },
        })
      )
    );

    return createSuccessResponse(notas, `${notas.length} notas cadastradas com sucesso`);
  }

  async update(id: number, data: NotaUpdateInput) {
    const notaExistente = await prisma.nota.findUnique({ where: { id } });
    if (!notaExistente) {
      throw new AppError('Nota não encontrada', 404, 'NOTA_NOT_FOUND');
    }

    const nota = await prisma.nota.update({
      where: { id },
      data: { notaObtida: data.notaObtida },
      include: {
        aluno: true,
        avaliacao: {
          include: {
            turmaProfessor: {
              include: { disciplina: true },
            },
          },
        },
      },
    });

    return createSuccessResponse(nota, 'Nota atualizada com sucesso');
  }

  async delete(id: number) {
    const nota = await prisma.nota.findUnique({ where: { id } });
    if (!nota) {
      throw new AppError('Nota não encontrada', 404, 'NOTA_NOT_FOUND');
    }

    await prisma.nota.delete({ where: { id } });

    return createSuccessResponse(null, 'Nota removida com sucesso');
  }
}

export const notaService = new NotaService();

export default notaService;
