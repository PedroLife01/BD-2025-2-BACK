/**
 * Seed: Vínculos Turma-Professor e Regras de Aprovação
 * =====================================================
 * IMPORTANTE: Os vínculos são criados dinamicamente
 * buscando por nome de turma, professor e disciplina,
 * em vez de IDs hardcoded.
 * =====================================================
 */
import { PrismaClient } from '@prisma/client';

export async function seedVinculos(prisma: PrismaClient) {
  console.log('🔗 Criando vínculos turma-professor...');

  // Buscar turmas
  const turma6A = await prisma.turma.findFirst({ where: { nome: '6º Ano A' } });
  const turma6B = await prisma.turma.findFirst({ where: { nome: '6º Ano B' } });
  const turma8A = await prisma.turma.findFirst({ where: { nome: '8º Ano A' } });

  // Buscar professores
  const profCarlos = await prisma.professor.findFirst({ where: { nome: { contains: 'Carlos' } } });
  const profAna = await prisma.professor.findFirst({ where: { nome: { contains: 'Ana Paula' } } });
  const profPaulo = await prisma.professor.findFirst({ where: { nome: { contains: 'Paulo' } } });
  const profMariana = await prisma.professor.findFirst({ where: { nome: { contains: 'Mariana' } } });
  const profRicardo = await prisma.professor.findFirst({ where: { nome: { contains: 'Ricardo' } } });

  // Buscar disciplinas
  const matematica = await prisma.disciplina.findFirst({ where: { nome: 'Matemática' } });
  const portugues = await prisma.disciplina.findFirst({ where: { nome: 'Português' } });
  const historia = await prisma.disciplina.findFirst({ where: { nome: 'História' } });
  const ciencias = await prisma.disciplina.findFirst({ where: { nome: 'Ciências' } });
  const geografia = await prisma.disciplina.findFirst({ where: { nome: 'Geografia' } });

  if (!turma6A || !turma6B || !matematica || !portugues || !historia) {
    console.log('   ⚠️ Turmas ou disciplinas não encontradas. Pulando vínculos.');
    return [];
  }

  const vinculosData: { turmaId: number; professorId: number; disciplinaId: number }[] = [];

  // Turma 6º Ano A
  if (profCarlos && matematica) vinculosData.push({ turmaId: turma6A.id, professorId: profCarlos.id, disciplinaId: matematica.id });
  if (profAna && portugues) vinculosData.push({ turmaId: turma6A.id, professorId: profAna.id, disciplinaId: portugues.id });
  if (profPaulo && historia) vinculosData.push({ turmaId: turma6A.id, professorId: profPaulo.id, disciplinaId: historia.id });

  // Turma 6º Ano B
  if (profCarlos && matematica) vinculosData.push({ turmaId: turma6B.id, professorId: profCarlos.id, disciplinaId: matematica.id });
  if (profAna && portugues) vinculosData.push({ turmaId: turma6B.id, professorId: profAna.id, disciplinaId: portugues.id });
  if (profPaulo && historia) vinculosData.push({ turmaId: turma6B.id, professorId: profPaulo.id, disciplinaId: historia.id });

  // Turma 8º Ano A (Escola 2)
  if (turma8A && profMariana && ciencias) vinculosData.push({ turmaId: turma8A.id, professorId: profMariana.id, disciplinaId: ciencias.id });
  if (turma8A && profRicardo && geografia) vinculosData.push({ turmaId: turma8A.id, professorId: profRicardo.id, disciplinaId: geografia.id });

  const vinculos = [];
  for (const v of vinculosData) {
    const existente = await prisma.turmaProfessor.findFirst({
      where: {
        idTurma: v.turmaId,
        idProfessor: v.professorId,
        idDisciplina: v.disciplinaId
      }
    });

    if (existente) {
      vinculos.push(existente);
    } else {
      const novo = await prisma.turmaProfessor.create({
        data: {
          idTurma: v.turmaId,
          idProfessor: v.professorId,
          idDisciplina: v.disciplinaId
        }
      });
      vinculos.push(novo);
    }
  }

  console.log(`   ✅ ${vinculos.length} vínculos criados/verificados`);
  return vinculos;
}

export async function seedRegrasAprovacao(prisma: PrismaClient) {
  console.log('📋 Criando regras de aprovação...');

  // Buscar escolas
  const escolas = await prisma.escola.findMany();
  
  // Buscar coordenadores
  const coordenadores = await prisma.coordenador.findMany();

  const regras = [];
  for (let i = 0; i < escolas.length; i++) {
    const escola = escolas[i];
    const coordenador = coordenadores[i] || coordenadores[0];
    
    if (!coordenador || !escola) continue;

    const existente = await prisma.regraAprovacao.findUnique({
      where: {
        idEscola_anoLetivo: { idEscola: escola.id, anoLetivo: 2025 }
      }
    });

    if (existente) {
      regras.push(existente);
    } else {
      const nova = await prisma.regraAprovacao.create({
        data: {
          idEscola: escola.id,
          idCoordenador: coordenador.id,
          anoLetivo: 2025,
          mediaMinima: i === 0 ? 6.0 : i === 1 ? 5.0 : 7.0,
        }
      });
      regras.push(nova);
    }
  }

  console.log(`   ✅ ${regras.length} regras de aprovação criadas/verificadas`);
  return regras;
}
