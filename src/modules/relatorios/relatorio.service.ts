/**
 * ============================================
 * SIGEA Backend - Serviço de Relatórios
 * ============================================
 * Gera relatórios de desempenho acadêmico
 */

import { prisma } from '../../config';
import { AppError, canProfessorAccessTurma } from '../../shared/middlewares';
import { createSuccessResponse } from '../../shared/utils';

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

/**
 * Interface para nota do boletim
 */
interface NotaBoletim {
  disciplina: string;
  professor: string;
  periodo: string;
  avaliacao: string;
  nota: number;
  peso: number;
  dataAplicacao: Date;
}

/**
 * Interface para boletim do aluno
 */
interface BoletimAluno {
  aluno: {
    id: number;
    nome: string;
    matricula: string;
    dataNascimento: Date | null;
  };
  turma: {
    id: number;
    nome: string;
    serie: string | null;
    anoLetivo: number;
    turno: string | null;
  };
  escola: {
    id: number;
    nome: string;
  };
  notas: NotaBoletim[];
  mediaGeral: number;
  totalAvaliacoes: number;
}

/**
 * Interface para desempenho de aluno em relatório de turma
 */
interface DesempenhoAlunoTurma {
  aluno: {
    id: number;
    nome: string;
    matricula: string;
  };
  mediaGeral: number;
  totalNotas: number;
  situacao: 'Aprovado' | 'Reprovado' | 'Em andamento';
}

/**
 * Interface para relatório da turma
 */
interface RelatorioTurma {
  turma: {
    id: number;
    nome: string;
    serie: string | null;
    anoLetivo: number;
    turno: string | null;
  };
  escola: {
    id: number;
    nome: string;
  };
  totalAlunos: number;
  totalAvaliacoes: number;
  mediaGeralTurma: number;
  disciplinas: {
    nome: string;
    professor: string;
    mediaDisciplina: number;
    totalAvaliacoes: number;
  }[];
  alunos: DesempenhoAlunoTurma[];
}

/**
 * Interface para estatísticas da escola
 */
interface EstatisticasEscola {
  escola: {
    id: number;
    nome: string;
  };
  totalTurmas: number;
  totalAlunos: number;
  totalProfessores: number;
  totalCoordenadores: number;
  totalDisciplinas: number;
  totalAvaliacoes: number;
  mediaGeralEscola: number;
  turmasPorSerie: {
    serie: string;
    quantidade: number;
  }[];
  desempenhoPorTurma: {
    turma: string;
    serie: string | null;
    mediaGeral: number;
    totalAlunos: number;
  }[];
}

export class RelatorioService {
  /**
   * Gera o boletim de um aluno
   */
  async getBoletimAluno(idAluno: number, user?: UserContext): Promise<ReturnType<typeof createSuccessResponse<BoletimAluno>>> {
    // Busca aluno com turma e escola
    const aluno = await prisma.aluno.findUnique({
      where: { id: idAluno },
      include: {
        turma: {
          include: { escola: true }
        }
      }
    });

    if (!aluno) {
      throw new AppError('Aluno não encontrado', 404, 'ALUNO_NOT_FOUND');
    }

    // Verifica acesso
    if (user) {
      if (user.role === 'ADMIN') {
        // Admin tem acesso total
      } else if (user.role === 'COORDENADOR') {
        if (aluno.turma?.escola?.id !== user.idEscola) {
          throw new AppError('Sem permissão para acessar boletim deste aluno', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'PROFESSOR') {
        // Professor pode ver boletim de alunos das suas turmas
        if (user.idProfessor) {
          const hasAccess = await canProfessorAccessTurma(user.idProfessor, aluno.idTurma);
          if (!hasAccess) {
            throw new AppError('Sem permissão para acessar boletim deste aluno', 403, 'FORBIDDEN');
          }
        }
      } else if (user.role === 'ALUNO') {
        if (idAluno !== user.idAluno) {
          throw new AppError('Sem permissão para acessar boletim de outro aluno', 403, 'FORBIDDEN');
        }
      }
    }

    // Busca todas as notas do aluno com detalhes
    const notas = await prisma.nota.findMany({
      where: { idAluno },
      include: {
        avaliacao: {
          include: {
            turmaProfessor: {
              include: {
                disciplina: true,
                professor: true,
              }
            },
            periodoLetivo: true,
          }
        }
      },
      orderBy: [
        { avaliacao: { periodoLetivo: { dataInicio: 'asc' } } },
        { avaliacao: { dataAplicacao: 'asc' } }
      ]
    });

    // Formata as notas para o boletim
    const notasFormatadas: NotaBoletim[] = notas.map(nota => ({
      disciplina: nota.avaliacao.turmaProfessor.disciplina.nome,
      professor: nota.avaliacao.turmaProfessor.professor.nome,
      periodo: nota.avaliacao.periodoLetivo.etapa, // Usando 'etapa' em vez de 'nome'
      avaliacao: nota.avaliacao.titulo, // Usando 'titulo' que existe no schema
      nota: nota.notaObtida.toNumber(),
      peso: nota.avaliacao.peso.toNumber(),
      dataAplicacao: nota.avaliacao.dataAplicacao,
    }));

    // Calcula média geral (ponderada pelo peso)
    let somaNotas = 0;
    let somaPesos = 0;
    notas.forEach(nota => {
      somaNotas += nota.notaObtida.toNumber() * nota.avaliacao.peso.toNumber();
      somaPesos += nota.avaliacao.peso.toNumber();
    });
    const mediaGeral = somaPesos > 0 ? somaNotas / somaPesos : 0;

    const boletim: BoletimAluno = {
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        matricula: aluno.matricula,
        dataNascimento: aluno.dataNascimento,
      },
      turma: {
        id: aluno.turma!.id,
        nome: aluno.turma!.nome,
        serie: aluno.turma!.serie,
        anoLetivo: aluno.turma!.anoLetivo,
        turno: aluno.turma!.turno,
      },
      escola: {
        id: aluno.turma!.escola.id,
        nome: aluno.turma!.escola.nome,
      },
      notas: notasFormatadas,
      mediaGeral: Math.round(mediaGeral * 100) / 100,
      totalAvaliacoes: notas.length,
    };

    return createSuccessResponse(boletim, 'Boletim gerado com sucesso');
  }

  /**
   * Gera relatório de desempenho de uma turma
   */
  async getRelatorioTurma(idTurma: number, user?: UserContext): Promise<ReturnType<typeof createSuccessResponse<RelatorioTurma>>> {
    // Busca turma com escola
    const turma = await prisma.turma.findUnique({
      where: { id: idTurma },
      include: { escola: true }
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
          throw new AppError('Sem permissão para acessar relatório desta turma', 403, 'FORBIDDEN');
        }
      } else if (user.role === 'PROFESSOR') {
        if (user.idProfessor) {
          const hasAccess = await canProfessorAccessTurma(user.idProfessor, idTurma);
          if (!hasAccess) {
            throw new AppError('Sem permissão para acessar relatório desta turma', 403, 'FORBIDDEN');
          }
        }
      } else {
        throw new AppError('Sem permissão para acessar relatório de turma', 403, 'FORBIDDEN');
      }
    }

    // Busca alunos da turma
    const alunos = await prisma.aluno.findMany({
      where: { idTurma },
      orderBy: { nome: 'asc' }
    });

    // Busca vínculos professor-turma-disciplina
    const turmasProfessores = await prisma.turmaProfessor.findMany({
      where: { idTurma },
      include: {
        disciplina: true,
        professor: true,
        avaliacoes: {
          include: {
            notas: true
          }
        }
      }
    });

    // Calcula estatísticas por disciplina
    const disciplinas = turmasProfessores.map(tp => {
      let somaNotas = 0;
      let somaPesos = 0;
      let totalAvaliacoes = tp.avaliacoes.length;

      tp.avaliacoes.forEach(av => {
        av.notas.forEach(nota => {
          somaNotas += nota.notaObtida.toNumber() * av.peso.toNumber();
          somaPesos += av.peso.toNumber();
        });
      });

      return {
        nome: tp.disciplina.nome,
        professor: tp.professor.nome,
        mediaDisciplina: somaPesos > 0 ? Math.round((somaNotas / somaPesos) * 100) / 100 : 0,
        totalAvaliacoes,
      };
    });

    // Busca regra de aprovação da escola (por ano letivo da turma)
    const regraAprovacao = await prisma.regraAprovacao.findFirst({
      where: { 
        idEscola: turma.idEscola,
        anoLetivo: turma.anoLetivo
      }
    });
    const notaMinima = regraAprovacao?.mediaMinima?.toNumber() || 6;

    // Calcula desempenho de cada aluno
    const desempenhoAlunos: DesempenhoAlunoTurma[] = await Promise.all(
      alunos.map(async aluno => {
        const notas = await prisma.nota.findMany({
          where: { idAluno: aluno.id },
          include: { avaliacao: true }
        });

        let somaNotas = 0;
        let somaPesos = 0;
        notas.forEach(nota => {
          somaNotas += nota.notaObtida.toNumber() * nota.avaliacao.peso.toNumber();
          somaPesos += nota.avaliacao.peso.toNumber();
        });
        const mediaGeral = somaPesos > 0 ? somaNotas / somaPesos : 0;

        // Determina situação
        let situacao: 'Aprovado' | 'Reprovado' | 'Em andamento' = 'Em andamento';
        if (notas.length > 0) {
          situacao = mediaGeral >= notaMinima ? 'Aprovado' : 'Reprovado';
        }

        return {
          aluno: {
            id: aluno.id,
            nome: aluno.nome,
            matricula: aluno.matricula,
          },
          mediaGeral: Math.round(mediaGeral * 100) / 100,
          totalNotas: notas.length,
          situacao,
        };
      })
    );

    // Calcula média geral da turma
    const mediasAlunos = desempenhoAlunos.map(d => d.mediaGeral);
    const mediaGeralTurma = mediasAlunos.length > 0
      ? Math.round((mediasAlunos.reduce((a, b) => a + b, 0) / mediasAlunos.length) * 100) / 100
      : 0;

    // Conta total de avaliações
    const totalAvaliacoes = disciplinas.reduce((acc, d) => acc + d.totalAvaliacoes, 0);

    const relatorio: RelatorioTurma = {
      turma: {
        id: turma.id,
        nome: turma.nome,
        serie: turma.serie,
        anoLetivo: turma.anoLetivo,
        turno: turma.turno,
      },
      escola: {
        id: turma.escola.id,
        nome: turma.escola.nome,
      },
      totalAlunos: alunos.length,
      totalAvaliacoes,
      mediaGeralTurma,
      disciplinas,
      alunos: desempenhoAlunos,
    };

    return createSuccessResponse(relatorio, 'Relatório da turma gerado com sucesso');
  }

  /**
   * Gera estatísticas gerais de uma escola
   */
  async getEstatisticasEscola(idEscola: number, user?: UserContext): Promise<ReturnType<typeof createSuccessResponse<EstatisticasEscola>>> {
    // Busca escola
    const escola = await prisma.escola.findUnique({
      where: { id: idEscola }
    });

    if (!escola) {
      throw new AppError('Escola não encontrada', 404, 'ESCOLA_NOT_FOUND');
    }

    // Verifica acesso
    if (user) {
      if (user.role === 'ADMIN') {
        // Admin tem acesso total
      } else if (user.role === 'COORDENADOR') {
        if (idEscola !== user.idEscola) {
          throw new AppError('Sem permissão para acessar estatísticas desta escola', 403, 'FORBIDDEN');
        }
      } else {
        throw new AppError('Sem permissão para acessar estatísticas de escola', 403, 'FORBIDDEN');
      }
    }

    // Conta totais
    const [
      totalTurmas,
      totalAlunos,
      totalProfessores,
      totalCoordenadores,
    ] = await Promise.all([
      prisma.turma.count({ where: { idEscola } }),
      prisma.aluno.count({ where: { turma: { idEscola } } }),
      prisma.professor.count({ where: { idEscola } }),
      prisma.coordenador.count({ where: { idEscola } }),
    ]);
    
    // Conta disciplinas únicas usadas nas turmas da escola
    const disciplinasUnicas = await prisma.turmaProfessor.findMany({
      where: { turma: { idEscola } },
      select: { idDisciplina: true },
      distinct: ['idDisciplina']
    });
    const totalDisciplinas = disciplinasUnicas.length;

    // Busca turmas da escola
    const turmas = await prisma.turma.findMany({
      where: { idEscola },
      include: {
        alunos: true,
        turmasProfessores: {
          include: {
            avaliacoes: {
              include: { notas: true }
            }
          }
        }
      }
    });

    // Conta avaliações e calcula médias
    let totalAvaliacoes = 0;
    let somaMediasGeral = 0;
    let totalAlunosComNota = 0;

    const desempenhoPorTurma = turmas.map(turma => {
      let somaNotasTurma = 0;
      let somaPesosTurma = 0;

      turma.turmasProfessores.forEach(tp => {
        totalAvaliacoes += tp.avaliacoes.length;
        tp.avaliacoes.forEach(av => {
          av.notas.forEach(nota => {
            somaNotasTurma += nota.notaObtida.toNumber() * av.peso.toNumber();
            somaPesosTurma += av.peso.toNumber();
          });
        });
      });

      const mediaTurma = somaPesosTurma > 0 ? somaNotasTurma / somaPesosTurma : 0;
      if (mediaTurma > 0) {
        somaMediasGeral += mediaTurma;
        totalAlunosComNota++;
      }

      return {
        turma: turma.nome,
        serie: turma.serie,
        mediaGeral: Math.round(mediaTurma * 100) / 100,
        totalAlunos: turma.alunos.length,
      };
    });

    // Agrupa turmas por série
    const turmasPorSerieMap = new Map<string, number>();
    turmas.forEach(turma => {
      const serie = turma.serie || 'Sem série';
      turmasPorSerieMap.set(serie, (turmasPorSerieMap.get(serie) || 0) + 1);
    });
    const turmasPorSerie = Array.from(turmasPorSerieMap.entries()).map(([serie, quantidade]) => ({
      serie,
      quantidade,
    }));

    // Calcula média geral da escola
    const mediaGeralEscola = totalAlunosComNota > 0
      ? Math.round((somaMediasGeral / totalAlunosComNota) * 100) / 100
      : 0;

    const estatisticas: EstatisticasEscola = {
      escola: {
        id: escola.id,
        nome: escola.nome,
      },
      totalTurmas,
      totalAlunos,
      totalProfessores,
      totalCoordenadores,
      totalDisciplinas,
      totalAvaliacoes,
      mediaGeralEscola,
      turmasPorSerie,
      desempenhoPorTurma,
    };

    return createSuccessResponse(estatisticas, 'Estatísticas da escola geradas com sucesso');
  }

  /**
   * Gera boletim do aluno logado
   */
  async getMeuBoletim(idAluno: number): Promise<ReturnType<typeof createSuccessResponse<BoletimAluno>>> {
    return this.getBoletimAluno(idAluno);
  }
}

export const relatorioService = new RelatorioService();

export default relatorioService;
