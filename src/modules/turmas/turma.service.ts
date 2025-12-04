/**
 * ============================================
 * SIGEA Backend - Serviço de Turmas
 * ============================================
 */

import { prisma } from '../../config';
import { TurmaInput, TurmaUpdateInput } from './turma.dto';
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

export class TurmaService {
  /**
   * Lista turmas com filtros baseados no contexto do usuário
   * - ADMIN: vê todas as turmas
   * - COORDENADOR: vê turmas da sua escola
   * - PROFESSOR: vê apenas turmas onde tem vínculo
   * - ALUNO: vê apenas sua própria turma
   */
  async findAll(params: PaginationParams, user?: UserContext) {
    const { skip, take } = getPaginationParams(params);

    // Monta filtro baseado no contexto do usuário
    let whereBase: any = {};
    
    if (user) {
      if (user.role === 'ADMIN') {
        // Admin vê tudo
      } else if (user.role === 'COORDENADOR' || user.role === 'PROFESSOR') {
        if (user.idEscola) {
          whereBase.idEscola = user.idEscola;
        }
        // Se for professor, filtra apenas as turmas onde tem vínculo
        if (user.role === 'PROFESSOR' && user.idProfessor) {
          whereBase.turmasProfessores = {
            some: { idProfessor: user.idProfessor }
          };
        }
      } else if (user.role === 'ALUNO' && user.idTurma) {
        whereBase.id = user.idTurma;
      }
    }

    const where = params.search
      ? {
          AND: [
            whereBase,
            {
              OR: [
                { nome: { contains: params.search, mode: 'insensitive' as const } },
                { serie: { contains: params.search, mode: 'insensitive' as const } },
              ],
            },
          ],
        }
      : whereBase;

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

  async findById(id: number, user?: UserContext) {
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

    // Verifica acesso
    if (user) {
      if (user.role === 'ADMIN') {
        // Admin tem acesso total
      } else if (user.role === 'COORDENADOR') {
        if (turma.idEscola !== user.idEscola) {
          throw new AppError('Sem permissão para acessar esta turma', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'PROFESSOR') {
        if (turma.idEscola !== user.idEscola) {
          throw new AppError('Sem permissão para acessar esta turma', 403, 'FORBIDDEN');
        }
        // Verifica vínculo professor-turma
        if (user.idProfessor) {
          const hasAccess = await canProfessorAccessTurma(user.idProfessor, id);
          if (!hasAccess) {
            throw new AppError('Sem permissão para acessar esta turma', 403, 'FORBIDDEN');
          }
        }
      } else if (user.role === 'ALUNO') {
        if (turma.id !== user.idTurma) {
          throw new AppError('Sem permissão para acessar esta turma', 403, 'FORBIDDEN');
        }
      }
    }

    return createSuccessResponse(turma);
  }

  async create(data: TurmaInput, user?: UserContext) {
    // Verifica se escola existe
    const escola = await prisma.escola.findUnique({ where: { id: data.idEscola } });
    if (!escola) {
      throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
    }

    // Verifica permissão para criar na escola
    if (user && user.role !== 'ADMIN' && user.idEscola !== data.idEscola) {
      throw new AppError('Sem permissão para criar turma nesta escola', 403, 'FORBIDDEN');
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

  async update(id: number, data: TurmaUpdateInput, user?: UserContext) {
    // Verifica acesso à turma antes de atualizar
    await this.findById(id, user);

    if (data.idEscola) {
      const escola = await prisma.escola.findUnique({ where: { id: data.idEscola } });
      if (!escola) {
        throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
      }
      // Verifica permissão para a nova escola
      if (user && user.role !== 'ADMIN' && user.idEscola !== data.idEscola) {
        throw new AppError('Sem permissão para mover turma para esta escola', 403, 'FORBIDDEN');
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

  async delete(id: number, user?: UserContext) {
    await this.findById(id, user);

    await prisma.turma.delete({ where: { id } });

    return createSuccessResponse(null, 'Turma removida com sucesso');
  }

  /**
   * Lista alunos de uma turma específica
   */
  async findAlunos(idTurma: number, params: PaginationParams, user?: UserContext) {
    await this.findById(idTurma, user);

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

  /**
   * Retorna turmas do professor logado
   */
  async findMinhasTurmas(idProfessor: number, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const whereBase = {
      turmasProfessores: {
        some: { idProfessor }
      }
    };

    const where = params.search
      ? {
          AND: [
            whereBase,
            {
              OR: [
                { nome: { contains: params.search, mode: 'insensitive' as const } },
                { serie: { contains: params.search, mode: 'insensitive' as const } },
              ],
            },
          ],
        }
      : whereBase;

    const [turmas, total] = await Promise.all([
      prisma.turma.findMany({
        where,
        skip,
        take,
        orderBy: [{ anoLetivo: 'desc' }, { nome: params.order }],
        include: {
          escola: true,
          turmasProfessores: {
            where: { idProfessor },
            include: { disciplina: true }
          },
          _count: {
            select: { alunos: true },
          },
        },
      }),
      prisma.turma.count({ where }),
    ]);

    return createPaginatedResponse(turmas, total, params);
  }
}

export const turmaService = new TurmaService();

export default turmaService;
