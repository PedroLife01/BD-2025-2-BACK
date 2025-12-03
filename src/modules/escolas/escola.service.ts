/**
 * ============================================
 * SIGEA Backend - Serviço de Escolas
 * ============================================
 * Lógica de negócio para gestão de escolas
 * ============================================
 */

import { prisma } from '../../config';
import { EscolaInput, EscolaUpdateInput } from './escola.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

/**
 * Serviço de escolas
 * Contém métodos CRUD para gestão de escolas
 */
export class EscolaService {
  /**
   * Lista todas as escolas com paginação
   *
   * @param params - Parâmetros de paginação e filtro
   * @returns Lista paginada de escolas
   */
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    // Filtro de busca por nome ou região
    const where = params.search
      ? {
          OR: [
            { nome: { contains: params.search, mode: 'insensitive' as const } },
            { regiaoAdministrativa: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Busca escolas e total em paralelo
    const [escolas, total] = await Promise.all([
      prisma.escola.findMany({
        where,
        skip,
        take,
        orderBy: { nome: params.order },
      }),
      prisma.escola.count({ where }),
    ]);

    return createPaginatedResponse(escolas, total, params);
  }

  /**
   * Busca uma escola por ID
   *
   * @param id - ID da escola
   * @returns Escola encontrada com relacionamentos
   * @throws AppError se não encontrada
   */
  async findById(id: number) {
    const escola = await prisma.escola.findUnique({
      where: { id },
      include: {
        coordenadores: true,
        professores: true,
        turmas: {
          include: {
            alunos: true,
          },
        },
        regrasAprovacao: true,
      },
    });

    if (!escola) {
      throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
    }

    return createSuccessResponse(escola);
  }

  /**
   * Cria uma nova escola
   *
   * @param data - Dados da escola
   * @returns Escola criada
   */
  async create(data: EscolaInput) {
    const escola = await prisma.escola.create({
      data: {
        nome: data.nome,
        cnpj: data.cnpj,
        telefone: data.telefone,
        email: data.email,
        regiaoAdministrativa: data.regiaoAdministrativa,
      },
    });

    return createSuccessResponse(escola, 'Escola criada com sucesso');
  }

  /**
   * Atualiza uma escola existente
   *
   * @param id - ID da escola
   * @param data - Dados para atualização
   * @returns Escola atualizada
   * @throws AppError se não encontrada
   */
  async update(id: number, data: EscolaUpdateInput) {
    // Verifica se existe
    await this.findById(id);

    const escola = await prisma.escola.update({
      where: { id },
      data: {
        nome: data.nome,
        cnpj: data.cnpj,
        telefone: data.telefone,
        email: data.email,
        regiaoAdministrativa: data.regiaoAdministrativa,
      },
    });

    return createSuccessResponse(escola, 'Escola atualizada com sucesso');
  }

  /**
   * Remove uma escola
   *
   * @param id - ID da escola
   * @returns Confirmação de exclusão
   * @throws AppError se não encontrada
   */
  async delete(id: number) {
    // Verifica se existe
    await this.findById(id);

    await prisma.escola.delete({
      where: { id },
    });

    return createSuccessResponse(null, 'Escola removida com sucesso');
  }

  /**
   * Lista turmas de uma escola específica
   *
   * @param idEscola - ID da escola
   * @param params - Parâmetros de paginação
   * @returns Lista paginada de turmas
   */
  async findTurmas(idEscola: number, params: PaginationParams) {
    // Verifica se escola existe
    await this.findById(idEscola);

    const { skip, take } = getPaginationParams(params);

    const where = { idEscola };

    const [turmas, total] = await Promise.all([
      prisma.turma.findMany({
        where,
        skip,
        take,
        orderBy: { nome: params.order },
        include: {
          _count: {
            select: { alunos: true },
          },
        },
      }),
      prisma.turma.count({ where }),
    ]);

    return createPaginatedResponse(turmas, total, params);
  }

  /**
   * Lista professores de uma escola específica
   *
   * @param idEscola - ID da escola
   * @param params - Parâmetros de paginação
   * @returns Lista paginada de professores
   */
  async findProfessores(idEscola: number, params: PaginationParams) {
    // Verifica se escola existe
    await this.findById(idEscola);

    const { skip, take } = getPaginationParams(params);

    const where = { idEscola };

    const [professores, total] = await Promise.all([
      prisma.professor.findMany({
        where,
        skip,
        take,
        orderBy: { nome: params.order },
      }),
      prisma.professor.count({ where }),
    ]);

    return createPaginatedResponse(professores, total, params);
  }

  /**
   * Lista coordenadores de uma escola específica
   *
   * @param idEscola - ID da escola
   * @param params - Parâmetros de paginação
   * @returns Lista paginada de coordenadores
   */
  async findCoordenadores(idEscola: number, params: PaginationParams) {
    // Verifica se escola existe
    await this.findById(idEscola);

    const { skip, take } = getPaginationParams(params);

    const where = { idEscola };

    const [coordenadores, total] = await Promise.all([
      prisma.coordenador.findMany({
        where,
        skip,
        take,
        orderBy: { nome: params.order },
      }),
      prisma.coordenador.count({ where }),
    ]);

    return createPaginatedResponse(coordenadores, total, params);
  }
}

/**
 * Instância singleton do serviço
 */
export const escolaService = new EscolaService();

export default escolaService;
