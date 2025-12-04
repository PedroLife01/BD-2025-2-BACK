/**
 * Seed: Avaliações e Notas
 * ===============================================
 * IMPORTANTE: As avaliações e notas são criadas
 * dinamicamente baseadas nos vínculos existentes,
 * buscando por relações em vez de IDs hardcoded.
 * ===============================================
 */
import { PrismaClient } from '@prisma/client';

interface AvaliacaoData {
  turmaNome: string;
  disciplinaNome: string;
  periodoEtapa: string;
  titulo: string;
  tipo: string;
  dataAplicacao: Date;
  peso: number;
}

interface NotaData {
  alunoMatricula: string;
  avaliacaoTitulo: string;
  nota: number;
}

export async function seedAvaliacoes(prisma: PrismaClient) {
  console.log('📝 Criando avaliações...');

  // Buscar turmas existentes
  const turma6A = await prisma.turma.findFirst({ where: { nome: '6º Ano A' } });
  const turma6B = await prisma.turma.findFirst({ where: { nome: '6º Ano B' } });
  const turma7A = await prisma.turma.findFirst({ where: { nome: '7º Ano A' } });
  const turma8A = await prisma.turma.findFirst({ where: { nome: '8º Ano A' } });

  // Buscar disciplinas
  const matematica = await prisma.disciplina.findFirst({ where: { nome: 'Matemática' } });
  const portugues = await prisma.disciplina.findFirst({ where: { nome: 'Português' } });
  const historia = await prisma.disciplina.findFirst({ where: { nome: 'História' } });
  const ciencias = await prisma.disciplina.findFirst({ where: { nome: 'Ciências' } });

  // Buscar períodos letivos
  const periodo1Bi = await prisma.periodoLetivo.findFirst({ where: { etapa: '1º Bimestre', ano: 2025 } });
  const periodo2Bi = await prisma.periodoLetivo.findFirst({ where: { etapa: '2º Bimestre', ano: 2025 } });
  const periodo3Bi = await prisma.periodoLetivo.findFirst({ where: { etapa: '3º Bimestre', ano: 2025 } });

  if (!turma6A || !turma6B || !matematica || !portugues || !historia || !periodo1Bi || !periodo2Bi) {
    console.log('   ⚠️ Turmas, disciplinas ou períodos não encontrados. Pulando avaliações.');
    return [];
  }

  // Buscar vínculos turma-professor
  const vinculos = await prisma.turmaProfessor.findMany({
    include: { turma: true, disciplina: true }
  });

  const findVinculo = (turmaId: number, disciplinaId: number) => {
    return vinculos.find(v => v.idTurma === turmaId && v.idDisciplina === disciplinaId);
  };

  const avaliacoesParaCriar: { vinculoId: number; periodoId: number; data: Omit<AvaliacaoData, 'turmaNome' | 'disciplinaNome' | 'periodoEtapa'> & { titulo: string; tipo: string; dataAplicacao: Date; peso: number } }[] = [];

  // === TURMA 6º ANO A ===
  const vinculoMat6A = findVinculo(turma6A.id, matematica.id);
  const vinculoPt6A = findVinculo(turma6A.id, portugues.id);
  const vinculoHist6A = findVinculo(turma6A.id, historia.id);

  if (vinculoMat6A) {
    avaliacoesParaCriar.push(
      { vinculoId: vinculoMat6A.id, periodoId: periodo1Bi.id, data: { titulo: 'Prova 1 - Números Inteiros', tipo: 'Prova', dataAplicacao: new Date('2025-03-15'), peso: 2.0 } },
      { vinculoId: vinculoMat6A.id, periodoId: periodo1Bi.id, data: { titulo: 'Trabalho - Operações Básicas', tipo: 'Trabalho', dataAplicacao: new Date('2025-03-28'), peso: 1.0 } },
      { vinculoId: vinculoMat6A.id, periodoId: periodo2Bi.id, data: { titulo: 'Prova 2 - Frações', tipo: 'Prova', dataAplicacao: new Date('2025-05-15'), peso: 2.0 } },
      { vinculoId: vinculoMat6A.id, periodoId: periodo2Bi.id, data: { titulo: 'Trabalho - Geometria Básica', tipo: 'Trabalho', dataAplicacao: new Date('2025-05-28'), peso: 1.0 } }
    );
  }
  if (vinculoPt6A) {
    avaliacoesParaCriar.push(
      { vinculoId: vinculoPt6A.id, periodoId: periodo1Bi.id, data: { titulo: 'Prova 1 - Interpretação de Texto', tipo: 'Prova', dataAplicacao: new Date('2025-03-18'), peso: 2.0 } },
      { vinculoId: vinculoPt6A.id, periodoId: periodo1Bi.id, data: { titulo: 'Redação - Minha Família', tipo: 'Redação', dataAplicacao: new Date('2025-04-01'), peso: 1.5 } },
      { vinculoId: vinculoPt6A.id, periodoId: periodo2Bi.id, data: { titulo: 'Prova 2 - Gramática', tipo: 'Prova', dataAplicacao: new Date('2025-05-18'), peso: 2.0 } }
    );
  }
  if (vinculoHist6A) {
    avaliacoesParaCriar.push(
      { vinculoId: vinculoHist6A.id, periodoId: periodo1Bi.id, data: { titulo: 'Prova 1 - Brasil Colonial', tipo: 'Prova', dataAplicacao: new Date('2025-03-20'), peso: 2.0 } },
      { vinculoId: vinculoHist6A.id, periodoId: periodo2Bi.id, data: { titulo: 'Seminário - Independência', tipo: 'Seminário', dataAplicacao: new Date('2025-05-20'), peso: 1.5 } }
    );
  }

  // === TURMA 6º ANO B ===
  const vinculoMat6B = findVinculo(turma6B.id, matematica.id);
  const vinculoPt6B = findVinculo(turma6B.id, portugues.id);
  const vinculoHist6B = findVinculo(turma6B.id, historia.id);

  if (vinculoMat6B) {
    avaliacoesParaCriar.push(
      { vinculoId: vinculoMat6B.id, periodoId: periodo1Bi.id, data: { titulo: 'Prova 1 - Números Inteiros', tipo: 'Prova', dataAplicacao: new Date('2025-03-15'), peso: 2.0 } },
      { vinculoId: vinculoMat6B.id, periodoId: periodo1Bi.id, data: { titulo: 'Trabalho - Operações Básicas', tipo: 'Trabalho', dataAplicacao: new Date('2025-03-28'), peso: 1.0 } },
      { vinculoId: vinculoMat6B.id, periodoId: periodo2Bi.id, data: { titulo: 'Prova 2 - Frações', tipo: 'Prova', dataAplicacao: new Date('2025-05-15'), peso: 2.0 } }
    );
  }
  if (vinculoPt6B) {
    avaliacoesParaCriar.push(
      { vinculoId: vinculoPt6B.id, periodoId: periodo1Bi.id, data: { titulo: 'Prova 1 - Interpretação de Texto', tipo: 'Prova', dataAplicacao: new Date('2025-03-18'), peso: 2.0 } },
      { vinculoId: vinculoPt6B.id, periodoId: periodo1Bi.id, data: { titulo: 'Redação - Minha Família', tipo: 'Redação', dataAplicacao: new Date('2025-04-01'), peso: 1.5 } }
    );
  }
  if (vinculoHist6B) {
    avaliacoesParaCriar.push(
      { vinculoId: vinculoHist6B.id, periodoId: periodo1Bi.id, data: { titulo: 'Prova 1 - Brasil Colonial', tipo: 'Prova', dataAplicacao: new Date('2025-03-20'), peso: 2.0 } }
    );
  }

  // === TURMA 8º ANO A (Escola 2) ===
  if (turma8A && ciencias) {
    const vinculoCiencias8A = findVinculo(turma8A.id, ciencias.id);
    if (vinculoCiencias8A) {
      avaliacoesParaCriar.push(
        { vinculoId: vinculoCiencias8A.id, periodoId: periodo1Bi.id, data: { titulo: 'Prova 1 - Células', tipo: 'Prova', dataAplicacao: new Date('2025-03-22'), peso: 2.0 } },
        { vinculoId: vinculoCiencias8A.id, periodoId: periodo2Bi.id, data: { titulo: 'Prova 2 - Tecidos', tipo: 'Prova', dataAplicacao: new Date('2025-05-22'), peso: 2.0 } }
      );
    }
  }

  // Criar avaliações usando upsert baseado em título + vínculo
  const avaliacoes = [];
  for (const av of avaliacoesParaCriar) {
    const existente = await prisma.avaliacao.findFirst({
      where: {
        idTurmaProfessor: av.vinculoId,
        titulo: av.data.titulo
      }
    });

    if (existente) {
      avaliacoes.push(existente);
    } else {
      const nova = await prisma.avaliacao.create({
        data: {
          idTurmaProfessor: av.vinculoId,
          idPeriodoLetivo: av.periodoId,
          titulo: av.data.titulo,
          tipo: av.data.tipo,
          dataAplicacao: av.data.dataAplicacao,
          peso: av.data.peso,
        }
      });
      avaliacoes.push(nova);
    }
  }

  console.log(`   ✅ ${avaliacoes.length} avaliações criadas/verificadas`);
  return avaliacoes;
}

export async function seedNotas(prisma: PrismaClient) {
  console.log('📊 Lançando notas...');

  // Buscar todos os alunos por matrícula
  const alunos = await prisma.aluno.findMany({
    include: { turma: true }
  });

  // Criar mapa de alunos por matrícula
  const alunosPorMatricula = new Map(alunos.map(a => [a.matricula, a]));

  // Buscar todas as avaliações com informações de turma
  const avaliacoes = await prisma.avaliacao.findMany({
    include: {
      turmaProfessor: {
        include: { turma: true, disciplina: true }
      }
    }
  });

  // Criar mapa de avaliações por turma e título
  const findAvaliacao = (turmaNome: string, titulo: string) => {
    return avaliacoes.find(a => 
      a.turmaProfessor.turma.nome === turmaNome && 
      a.titulo === titulo
    );
  };

  // Definir notas: matrícula do aluno -> avaliações
  const notasData: { matricula: string; turmaNome: string; avaliacaoTitulo: string; nota: number }[] = [
    // ========================================
    // TURMA 6º ANO A - 5 alunos: 2025001, 2025002, 2025003, 2025004, 2025005
    // ========================================
    
    // Lucas Silva Santos (2025001) - Turma 6º Ano A
    { matricula: '2025001', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Números Inteiros', nota: 8.5 },
    { matricula: '2025001', turmaNome: '6º Ano A', avaliacaoTitulo: 'Trabalho - Operações Básicas', nota: 9.0 },
    { matricula: '2025001', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 2 - Frações', nota: 7.5 },
    { matricula: '2025001', turmaNome: '6º Ano A', avaliacaoTitulo: 'Trabalho - Geometria Básica', nota: 8.0 },
    { matricula: '2025001', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Interpretação de Texto', nota: 7.0 },
    { matricula: '2025001', turmaNome: '6º Ano A', avaliacaoTitulo: 'Redação - Minha Família', nota: 8.0 },
    { matricula: '2025001', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 2 - Gramática', nota: 7.5 },
    { matricula: '2025001', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Brasil Colonial', nota: 9.0 },
    { matricula: '2025001', turmaNome: '6º Ano A', avaliacaoTitulo: 'Seminário - Independência', nota: 8.5 },

    // Maria Eduarda Oliveira (2025002) - Turma 6º Ano A
    { matricula: '2025002', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Números Inteiros', nota: 9.5 },
    { matricula: '2025002', turmaNome: '6º Ano A', avaliacaoTitulo: 'Trabalho - Operações Básicas', nota: 10.0 },
    { matricula: '2025002', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 2 - Frações', nota: 9.0 },
    { matricula: '2025002', turmaNome: '6º Ano A', avaliacaoTitulo: 'Trabalho - Geometria Básica', nota: 9.5 },
    { matricula: '2025002', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Interpretação de Texto', nota: 9.5 },
    { matricula: '2025002', turmaNome: '6º Ano A', avaliacaoTitulo: 'Redação - Minha Família', nota: 9.0 },
    { matricula: '2025002', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 2 - Gramática', nota: 9.5 },
    { matricula: '2025002', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Brasil Colonial', nota: 8.5 },
    { matricula: '2025002', turmaNome: '6º Ano A', avaliacaoTitulo: 'Seminário - Independência', nota: 9.0 },

    // Pedro Henrique Costa (2025003) - Turma 6º Ano A
    { matricula: '2025003', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Números Inteiros', nota: 6.0 },
    { matricula: '2025003', turmaNome: '6º Ano A', avaliacaoTitulo: 'Trabalho - Operações Básicas', nota: 7.0 },
    { matricula: '2025003', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 2 - Frações', nota: 5.5 },
    { matricula: '2025003', turmaNome: '6º Ano A', avaliacaoTitulo: 'Trabalho - Geometria Básica', nota: 6.5 },
    { matricula: '2025003', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Interpretação de Texto', nota: 5.5 },
    { matricula: '2025003', turmaNome: '6º Ano A', avaliacaoTitulo: 'Redação - Minha Família', nota: 6.5 },
    { matricula: '2025003', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 2 - Gramática', nota: 6.0 },
    { matricula: '2025003', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Brasil Colonial', nota: 7.0 },
    { matricula: '2025003', turmaNome: '6º Ano A', avaliacaoTitulo: 'Seminário - Independência', nota: 7.5 },

    // Ana Clara Ferreira (2025004) - Turma 6º Ano A
    { matricula: '2025004', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Números Inteiros', nota: 7.5 },
    { matricula: '2025004', turmaNome: '6º Ano A', avaliacaoTitulo: 'Trabalho - Operações Básicas', nota: 8.0 },
    { matricula: '2025004', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 2 - Frações', nota: 7.0 },
    { matricula: '2025004', turmaNome: '6º Ano A', avaliacaoTitulo: 'Trabalho - Geometria Básica', nota: 8.0 },
    { matricula: '2025004', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Interpretação de Texto', nota: 8.5 },
    { matricula: '2025004', turmaNome: '6º Ano A', avaliacaoTitulo: 'Redação - Minha Família', nota: 9.0 },
    { matricula: '2025004', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 2 - Gramática', nota: 8.5 },
    { matricula: '2025004', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Brasil Colonial', nota: 8.0 },
    { matricula: '2025004', turmaNome: '6º Ano A', avaliacaoTitulo: 'Seminário - Independência', nota: 8.5 },

    // Gabriel Rodrigues (2025005) - Turma 6º Ano A
    { matricula: '2025005', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Números Inteiros', nota: 4.5 },
    { matricula: '2025005', turmaNome: '6º Ano A', avaliacaoTitulo: 'Trabalho - Operações Básicas', nota: 5.0 },
    { matricula: '2025005', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 2 - Frações', nota: 4.0 },
    { matricula: '2025005', turmaNome: '6º Ano A', avaliacaoTitulo: 'Trabalho - Geometria Básica', nota: 5.5 },
    { matricula: '2025005', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Interpretação de Texto', nota: 6.0 },
    { matricula: '2025005', turmaNome: '6º Ano A', avaliacaoTitulo: 'Redação - Minha Família', nota: 5.5 },
    { matricula: '2025005', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 2 - Gramática', nota: 5.0 },
    { matricula: '2025005', turmaNome: '6º Ano A', avaliacaoTitulo: 'Prova 1 - Brasil Colonial', nota: 7.5 },
    { matricula: '2025005', turmaNome: '6º Ano A', avaliacaoTitulo: 'Seminário - Independência', nota: 6.0 },

    // ========================================
    // TURMA 6º ANO B - 2 alunos: 2025006, 2025007
    // ========================================
    
    // Beatriz Almeida (2025006) - Turma 6º Ano B
    { matricula: '2025006', turmaNome: '6º Ano B', avaliacaoTitulo: 'Prova 1 - Números Inteiros', nota: 8.0 },
    { matricula: '2025006', turmaNome: '6º Ano B', avaliacaoTitulo: 'Trabalho - Operações Básicas', nota: 8.5 },
    { matricula: '2025006', turmaNome: '6º Ano B', avaliacaoTitulo: 'Prova 2 - Frações', nota: 7.5 },
    { matricula: '2025006', turmaNome: '6º Ano B', avaliacaoTitulo: 'Prova 1 - Interpretação de Texto', nota: 9.0 },
    { matricula: '2025006', turmaNome: '6º Ano B', avaliacaoTitulo: 'Redação - Minha Família', nota: 8.5 },
    { matricula: '2025006', turmaNome: '6º Ano B', avaliacaoTitulo: 'Prova 1 - Brasil Colonial', nota: 7.0 },

    // Matheus Lima (2025007) - Turma 6º Ano B
    { matricula: '2025007', turmaNome: '6º Ano B', avaliacaoTitulo: 'Prova 1 - Números Inteiros', nota: 7.0 },
    { matricula: '2025007', turmaNome: '6º Ano B', avaliacaoTitulo: 'Trabalho - Operações Básicas', nota: 7.5 },
    { matricula: '2025007', turmaNome: '6º Ano B', avaliacaoTitulo: 'Prova 2 - Frações', nota: 6.5 },
    { matricula: '2025007', turmaNome: '6º Ano B', avaliacaoTitulo: 'Prova 1 - Interpretação de Texto', nota: 6.0 },
    { matricula: '2025007', turmaNome: '6º Ano B', avaliacaoTitulo: 'Redação - Minha Família', nota: 7.0 },
    { matricula: '2025007', turmaNome: '6º Ano B', avaliacaoTitulo: 'Prova 1 - Brasil Colonial', nota: 8.0 },

    // ========================================
    // TURMA 8º ANO A (Escola 2) - 2 alunos: 2025011, 2025012
    // ========================================
    
    // Daniel Souza (2025011) - Turma 8º Ano A
    { matricula: '2025011', turmaNome: '8º Ano A', avaliacaoTitulo: 'Prova 1 - Células', nota: 8.0 },
    { matricula: '2025011', turmaNome: '8º Ano A', avaliacaoTitulo: 'Prova 2 - Tecidos', nota: 7.5 },

    // Valentina Gomes (2025012) - Turma 8º Ano A
    { matricula: '2025012', turmaNome: '8º Ano A', avaliacaoTitulo: 'Prova 1 - Células', nota: 9.5 },
    { matricula: '2025012', turmaNome: '8º Ano A', avaliacaoTitulo: 'Prova 2 - Tecidos', nota: 9.0 },
  ];

  // Criar notas
  let notasCriadas = 0;
  let notasIgnoradas = 0;

  for (const n of notasData) {
    const aluno = alunosPorMatricula.get(n.matricula);
    const avaliacao = findAvaliacao(n.turmaNome, n.avaliacaoTitulo);

    if (!aluno) {
      console.log(`   ⚠️ Aluno ${n.matricula} não encontrado`);
      notasIgnoradas++;
      continue;
    }

    if (!avaliacao) {
      console.log(`   ⚠️ Avaliação "${n.avaliacaoTitulo}" na turma "${n.turmaNome}" não encontrada`);
      notasIgnoradas++;
      continue;
    }

    // Verificar se já existe nota para este aluno nesta avaliação
    const notaExistente = await prisma.nota.findFirst({
      where: {
        idAluno: aluno.id,
        idAvaliacao: avaliacao.id
      }
    });

    if (notaExistente) {
      notasIgnoradas++;
      continue;
    }

    await prisma.nota.create({
      data: {
        idAluno: aluno.id,
        idAvaliacao: avaliacao.id,
        notaObtida: n.nota,
        dataLancamento: new Date()
      }
    });
    notasCriadas++;
  }

  console.log(`   ✅ ${notasCriadas} notas lançadas (${notasIgnoradas} já existiam ou ignoradas)`);
}
