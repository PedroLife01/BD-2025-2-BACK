/**
 * ============================================
 * SIGEA Backend - Serviço de Avaliações
 * ============================================
 * Gerencia avaliações (provas) com suporte a upload de PDF
 */

import { prisma } from '../../config';
import { AvaliacaoInput, AvaliacaoUpdateInput } from './avaliacao.dto';
import { AppError } from '../../shared/middlewares';
import {
  PaginationParams,
  getPaginationParams,
  createPaginatedResponse,
  createSuccessResponse,
} from '../../shared/utils';

export class AvaliacaoService {
  async findAll(params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where = params.search
      ? {
          titulo: { contains: params.search, mode: 'insensitive' as const },
        }
      : {};

    const [avaliacoes, total] = await Promise.all([
      prisma.avaliacao.findMany({
        where,
        skip,
        take,
        orderBy: { dataAplicacao: params.order === 'asc' ? 'asc' : 'desc' },
        include: {
          turmaProfessor: {
            include: {
              turma: { include: { escola: true } },
              professor: true,
              disciplina: true,
            },
          },
          periodoLetivo: true,
          _count: {
            select: { notas: true },
          },
        },
      }),
      prisma.avaliacao.count({ where }),
    ]);

    // Remove arquivoProva do retorno para não sobrecarregar a listagem
    const avaliacoesSemArquivo = avaliacoes.map((av: typeof avaliacoes[number]) => {
      const { arquivoProva, ...rest } = av;
      return {
        ...rest,
        temArquivo: !!arquivoProva,
      };
    });

    return createPaginatedResponse(avaliacoesSemArquivo, total, params);
  }

  async findById(id: number) {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id },
      include: {
        turmaProfessor: {
          include: {
            turma: { include: { escola: true } },
            professor: true,
            disciplina: true,
          },
        },
        periodoLetivo: true,
        notas: {
          include: { aluno: true },
        },
      },
    });

    if (!avaliacao) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    // Retorna sem o arquivo binário, mas indica se existe
    const { arquivoProva, ...avaliacaoSemArquivo } = avaliacao;
    return createSuccessResponse({
      ...avaliacaoSemArquivo,
      temArquivo: !!arquivoProva,
    });
  }

  async findByTurmaProfessor(idTurmaProfessor: number, params: PaginationParams) {
    const vinculo = await prisma.turmaProfessor.findUnique({ where: { id: idTurmaProfessor } });
    if (!vinculo) {
      throw new AppError('Vínculo turma-professor não encontrado', 404, 'VINCULO_NOT_FOUND');
    }

    const { skip, take } = getPaginationParams(params);

    const where = { idTurmaProfessor };

    const [avaliacoes, total] = await Promise.all([
      prisma.avaliacao.findMany({
        where,
        skip,
        take,
        orderBy: { dataAplicacao: params.order === 'asc' ? 'asc' : 'desc' },
        include: {
          periodoLetivo: true,
          _count: { select: { notas: true } },
        },
      }),
      prisma.avaliacao.count({ where }),
    ]);

    const avaliacoesSemArquivo = avaliacoes.map((av: typeof avaliacoes[number]) => {
      const { arquivoProva, ...rest } = av;
      return {
        ...rest,
        temArquivo: !!arquivoProva,
      };
    });

    return createPaginatedResponse(avaliacoesSemArquivo, total, params);
  }

  async create(data: AvaliacaoInput, arquivoProva?: Buffer) {
    // Valida vínculo turma-professor
    const vinculo = await prisma.turmaProfessor.findUnique({ where: { id: data.idTurmaProfessor } });
    if (!vinculo) {
      throw new AppError('Vínculo turma-professor não encontrado', 404, 'VINCULO_NOT_FOUND');
    }

    // Valida período letivo
    const periodo = await prisma.periodoLetivo.findUnique({ where: { id: data.idPeriodoLetivo } });
    if (!periodo) {
      throw new AppError('Período letivo não encontrado', 404, 'PERIODO_NOT_FOUND');
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        idTurmaProfessor: data.idTurmaProfessor,
        idPeriodoLetivo: data.idPeriodoLetivo,
        titulo: data.titulo,
        tipo: data.tipo,
        dataAplicacao: data.dataAplicacao,
        peso: data.peso,
        arquivoProva: arquivoProva ? new Uint8Array(arquivoProva) : null,
      },
      include: {
        turmaProfessor: {
          include: {
            turma: true,
            professor: true,
            disciplina: true,
          },
        },
        periodoLetivo: true,
      },
    });

    const { arquivoProva: _, ...avaliacaoSemArquivo } = avaliacao;
    return createSuccessResponse(
      { ...avaliacaoSemArquivo, temArquivo: !!arquivoProva },
      'Avaliação criada com sucesso'
    );
  }

  async update(id: number, data: AvaliacaoUpdateInput, arquivoProva?: Buffer) {
    const avaliacaoExistente = await prisma.avaliacao.findUnique({ where: { id } });
    if (!avaliacaoExistente) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    // Valida vínculo se fornecido
    if (data.idTurmaProfessor) {
      const vinculo = await prisma.turmaProfessor.findUnique({ where: { id: data.idTurmaProfessor } });
      if (!vinculo) {
        throw new AppError('Vínculo turma-professor não encontrado', 404, 'VINCULO_NOT_FOUND');
      }
    }

    // Valida período se fornecido
    if (data.idPeriodoLetivo) {
      const periodo = await prisma.periodoLetivo.findUnique({ where: { id: data.idPeriodoLetivo } });
      if (!periodo) {
        throw new AppError('Período letivo não encontrado', 404, 'PERIODO_NOT_FOUND');
      }
    }

    const updateData: Record<string, unknown> = {
      idTurmaProfessor: data.idTurmaProfessor,
      idPeriodoLetivo: data.idPeriodoLetivo,
      titulo: data.titulo,
      tipo: data.tipo,
      dataAplicacao: data.dataAplicacao,
      peso: data.peso,
    };

    // Só atualiza arquivo se foi enviado um novo
    if (arquivoProva) {
      updateData.arquivoProva = new Uint8Array(arquivoProva);
    }

    const avaliacao = await prisma.avaliacao.update({
      where: { id },
      data: updateData,
      include: {
        turmaProfessor: {
          include: {
            turma: true,
            professor: true,
            disciplina: true,
          },
        },
        periodoLetivo: true,
      },
    });

    const { arquivoProva: _, ...avaliacaoSemArquivo } = avaliacao;
    return createSuccessResponse(
      { ...avaliacaoSemArquivo, temArquivo: true },
      'Avaliação atualizada com sucesso'
    );
  }

  async delete(id: number) {
    const avaliacao = await prisma.avaliacao.findUnique({ where: { id } });
    if (!avaliacao) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    await prisma.avaliacao.delete({ where: { id } });

    return createSuccessResponse(null, 'Avaliação removida com sucesso');
  }

  /**
   * Download do arquivo PDF da prova
   */
  async downloadArquivo(id: number) {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        arquivoProva: true,
        nomeArquivo: true,
      },
    });

    if (!avaliacao) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    if (!avaliacao.arquivoProva) {
      throw new AppError('Esta avaliação não possui arquivo de prova', 404, 'ARQUIVO_NOT_FOUND');
    }

    return {
      buffer: Buffer.from(avaliacao.arquivoProva),
      filename: avaliacao.nomeArquivo || `prova_${avaliacao.id}_${avaliacao.titulo.replace(/\s+/g, '_')}.pdf`,
    };
  }

  /**
   * Remove apenas o arquivo da prova
   */
  async removeArquivo(id: number) {
    const avaliacao = await prisma.avaliacao.findUnique({ where: { id } });
    if (!avaliacao) {
      throw new AppError('Avaliação não encontrada', 404, 'AVALIACAO_NOT_FOUND');
    }

    if (!avaliacao.arquivoProva) {
      throw new AppError('Esta avaliação não possui arquivo de prova', 404, 'ARQUIVO_NOT_FOUND');
    }

    await prisma.avaliacao.update({
      where: { id },
      data: { arquivoProva: null },
    });

    return createSuccessResponse(null, 'Arquivo da prova removido com sucesso');
  }
}

export const avaliacaoService = new AvaliacaoService();

export default avaliacaoService;
