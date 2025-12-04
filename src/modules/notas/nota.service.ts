/**
 * ============================================
 * SIGEA Backend - Serviço de Notas
 * ============================================
 * Gerencia as notas dos alunos em avaliações
 * Implementa controle de acesso por usuário/escola
 */

import { prisma } from '../../config';
import { NotaInput, NotaUpdateInput, NotasBatchInput } from './nota.dto';
import { AppError, canProfessorAccessTurma } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

/**
 * Contexto do usuário para filtros de acesso
 */
interface UserContext {
  id: number;
  email: string;
  role: 'ADMIN' | 'COORDENADOR' | 'PROFESSOR' | 'ALUNO';
  idEscola?: number | null;
  idProfessor?: number | null;
  idCoordenador?: number | null;
  idAluno?: number | null;
  idTurma?: number | null;
}

export class NotaService {
  /**
   * Lista notas com filtros baseados no contexto do usuário
   * - ADMIN: vê todas
   * - COORDENADOR: vê notas da sua escola
   * - PROFESSOR: vê notas das suas turmas
   * - ALUNO: vê apenas suas próprias notas
   */
  async findAll(params: PaginationParams, user?: UserContext) {
    const { skip, take } = getPaginationParams(params);

    // Monta filtro baseado no contexto do usuário
    let whereBase: any = {};
    
    if (user) {
      if (user.role === 'ADMIN') {
        // Admin vê tudo
      } else if (user.role === 'COORDENADOR' && user.idEscola) {
        whereBase.aluno = {
          turma: { idEscola: user.idEscola }
        };
      } else if (user.role === 'PROFESSOR' && user.idProfessor) {
        whereBase.avaliacao = {
          turmaProfessor: { idProfessor: user.idProfessor }
        };
      } else if (user.role === 'ALUNO' && user.idAluno) {
        whereBase.idAluno = user.idAluno;
      }
    }

    const [notas, total] = await Promise.all([
      prisma.nota.findMany({
        where: whereBase,
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
      prisma.nota.count({ where: whereBase }),
    ]);

    return createPaginatedResponse(notas, total, params);
  }

  async findById(id: number, user?: UserContext) {
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
                turma: true,
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

    // Verifica acesso
    if (user) {
      const idEscolaNota = nota.avaliacao.turmaProfessor.turma?.idEscola;
      
      if (user.role === 'ADMIN') {
        // Admin tem acesso total
      } else if (user.role === 'COORDENADOR') {
        if (idEscolaNota !== user.idEscola) {
          throw new AppError('Sem permissão para acessar esta nota', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'PROFESSOR') {
        if (nota.avaliacao.turmaProfessor.idProfessor !== user.idProfessor) {
          throw new AppError('Sem permissão para acessar esta nota', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'ALUNO') {
        if (nota.idAluno !== user.idAluno) {
          throw new AppError('Sem permissão para acessar esta nota', 403, 'FORBIDDEN');
        }
      }
    }

    return createSuccessResponse(nota);
  }

  async findByAvaliacao(idAvaliacao: number, params: PaginationParams, user?: UserContext) {
    const avaliacao = await prisma.avaliacao.findUnique({ 
      where: { id: idAvaliacao },
      include: {
        turmaProfessor: {
          include: { turma: true }
        }
      }
    });
    if (!avaliacao) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    // Verifica acesso à avaliação
    if (user) {
      const idEscolaAvaliacao = avaliacao.turmaProfessor.turma?.idEscola;
      
      if (user.role === 'ADMIN') {
        // Admin tem acesso total
      } else if (user.role === 'COORDENADOR') {
        if (idEscolaAvaliacao !== user.idEscola) {
          throw new AppError('Sem permissão para acessar notas desta avaliação', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'PROFESSOR') {
        if (avaliacao.turmaProfessor.idProfessor !== user.idProfessor) {
          throw new AppError('Sem permissão para acessar notas desta avaliação', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'ALUNO') {
        // Aluno só vê sua própria nota
        if (avaliacao.turmaProfessor.idTurma !== user.idTurma) {
          throw new AppError('Sem permissão para acessar notas desta avaliação', 403, 'FORBIDDEN');
        }
      }
    }

    const { skip, take } = getPaginationParams(params);

    let where: any = { idAvaliacao };
    
    // Se for aluno, filtra apenas sua nota
    if (user?.role === 'ALUNO' && user.idAluno) {
      where.idAluno = user.idAluno;
    }

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

  async findByAluno(idAluno: number, params: PaginationParams, user?: UserContext) {
    const aluno = await prisma.aluno.findUnique({ 
      where: { id: idAluno },
      include: { turma: true }
    });
    if (!aluno) {
      throw new AppError('Aluno não encontrado', 404, 'ALUNO_NOT_FOUND');
    }

    // Verifica acesso
    if (user) {
      if (user.role === 'ADMIN') {
        // Admin tem acesso total
      } else if (user.role === 'COORDENADOR') {
        if (aluno.turma?.idEscola !== user.idEscola) {
          throw new AppError('Sem permissão para acessar notas deste aluno', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'PROFESSOR') {
        // Professor pode ver notas de alunos das suas turmas
        if (user.idProfessor) {
          const hasAccess = await canProfessorAccessTurma(user.idProfessor, aluno.idTurma);
          if (!hasAccess) {
            throw new AppError('Sem permissão para acessar notas deste aluno', 403, 'FORBIDDEN');
          }
        }
      } else if (user.role === 'ALUNO') {
        if (idAluno !== user.idAluno) {
          throw new AppError('Sem permissão para acessar notas de outro aluno', 403, 'FORBIDDEN');
        }
      }
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

  /**
   * Retorna as notas do aluno logado
   */
  async findMinhasNotas(idAluno: number, params: PaginationParams) {
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

  async create(data: NotaInput, user?: UserContext) {
    // Valida avaliação
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: data.idAvaliacao },
      include: { turmaProfessor: { include: { turma: true } } },
    });
    if (!avaliacao) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    // Verifica permissão para lançar nota
    if (user) {
      const idEscolaAvaliacao = avaliacao.turmaProfessor.turma?.idEscola;
      
      if (user.role === 'ADMIN') {
        // Admin pode tudo
      } else if (user.role === 'COORDENADOR') {
        if (idEscolaAvaliacao !== user.idEscola) {
          throw new AppError('Sem permissão para lançar nota nesta escola', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'PROFESSOR') {
        if (avaliacao.turmaProfessor.idProfessor !== user.idProfessor) {
          throw new AppError('Sem permissão para lançar nota nesta avaliação', 403, 'FORBIDDEN');
        }
      } else {
        throw new AppError('Sem permissão para lançar notas', 403, 'FORBIDDEN');
      }
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
  async createBatch(data: NotasBatchInput, user?: UserContext) {
    // Valida avaliação
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: data.idAvaliacao },
      include: { turmaProfessor: { include: { turma: true } } },
    });
    if (!avaliacao) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    // Verifica permissão para lançar notas
    if (user) {
      const idEscolaAvaliacao = avaliacao.turmaProfessor.turma?.idEscola;
      
      if (user.role === 'ADMIN') {
        // Admin pode tudo
      } else if (user.role === 'COORDENADOR') {
        if (idEscolaAvaliacao !== user.idEscola) {
          throw new AppError('Sem permissão para lançar notas nesta escola', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'PROFESSOR') {
        if (avaliacao.turmaProfessor.idProfessor !== user.idProfessor) {
          throw new AppError('Sem permissão para lançar notas nesta avaliação', 403, 'FORBIDDEN');
        }
      } else {
        throw new AppError('Sem permissão para lançar notas', 403, 'FORBIDDEN');
      }
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

  async update(id: number, data: NotaUpdateInput, user?: UserContext) {
    // Busca nota com dados da avaliação para verificar acesso
    const notaExistente = await prisma.nota.findUnique({ 
      where: { id },
      include: {
        avaliacao: {
          include: { turmaProfessor: { include: { turma: true } } }
        }
      }
    });
    if (!notaExistente) {
      throw new AppError('Nota não encontrada', 404, 'NOTA_NOT_FOUND');
    }

    // Verifica permissão para editar nota
    if (user) {
      const idEscolaNota = notaExistente.avaliacao.turmaProfessor.turma?.idEscola;
      
      if (user.role === 'ADMIN') {
        // Admin pode tudo
      } else if (user.role === 'COORDENADOR') {
        if (idEscolaNota !== user.idEscola) {
          throw new AppError('Sem permissão para editar esta nota', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'PROFESSOR') {
        if (notaExistente.avaliacao.turmaProfessor.idProfessor !== user.idProfessor) {
          throw new AppError('Sem permissão para editar esta nota', 403, 'FORBIDDEN');
        }
      } else {
        throw new AppError('Sem permissão para editar notas', 403, 'FORBIDDEN');
      }
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

  async delete(id: number, user?: UserContext) {
    const nota = await prisma.nota.findUnique({ 
      where: { id },
      include: {
        avaliacao: {
          include: { turmaProfessor: { include: { turma: true } } }
        }
      }
    });
    if (!nota) {
      throw new AppError('Nota não encontrada', 404, 'NOTA_NOT_FOUND');
    }

    // Verifica permissão para deletar nota
    if (user) {
      const idEscolaNota = nota.avaliacao.turmaProfessor.turma?.idEscola;
      
      if (user.role === 'ADMIN') {
        // Admin pode tudo
      } else if (user.role === 'COORDENADOR') {
        if (idEscolaNota !== user.idEscola) {
          throw new AppError('Sem permissão para deletar esta nota', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'PROFESSOR') {
        if (nota.avaliacao.turmaProfessor.idProfessor !== user.idProfessor) {
          throw new AppError('Sem permissão para deletar esta nota', 403, 'FORBIDDEN');
        }
      } else {
        throw new AppError('Sem permissão para deletar notas', 403, 'FORBIDDEN');
      }
    }

    await prisma.nota.delete({ where: { id } });

    return createSuccessResponse(null, 'Nota removida com sucesso');
  }
}

export const notaService = new NotaService();

export default notaService;
