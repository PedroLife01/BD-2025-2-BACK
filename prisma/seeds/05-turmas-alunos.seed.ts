/**
 * Seed: Turmas e Alunos
 * ===============================================
 * IMPORTANTE: Os alunos são vinculados às turmas
 * dinamicamente buscando por nome da turma,
 * em vez de IDs hardcoded.
 * ===============================================
 */
import { PrismaClient } from '@prisma/client';

export async function seedTurmas(prisma: PrismaClient) {
  console.log('🎒 Criando turmas...');

  // Buscar escolas
  const escola1 = await prisma.escola.findFirst({ where: { nome: { contains: 'Anísio Teixeira' } } });
  const escola2 = await prisma.escola.findFirst({ where: { nome: { contains: 'Darcy Ribeiro' } } });

  if (!escola1 || !escola2) {
    console.log('   ⚠️ Escolas não encontradas. Pulando criação de turmas.');
    return [];
  }

  const turmasData = [
    { escola: escola1.id, nome: '6º Ano A', serie: '6º Ano', turno: 'Matutino', anoLetivo: 2025 },
    { escola: escola1.id, nome: '6º Ano B', serie: '6º Ano', turno: 'Vespertino', anoLetivo: 2025 },
    { escola: escola1.id, nome: '7º Ano A', serie: '7º Ano', turno: 'Matutino', anoLetivo: 2025 },
    { escola: escola2.id, nome: '8º Ano A', serie: '8º Ano', turno: 'Matutino', anoLetivo: 2025 },
    { escola: escola2.id, nome: '9º Ano A', serie: '9º Ano', turno: 'Matutino', anoLetivo: 2025 },
  ];

  const turmas = [];
  for (const t of turmasData) {
    const existente = await prisma.turma.findFirst({
      where: { nome: t.nome, idEscola: t.escola, anoLetivo: t.anoLetivo }
    });

    if (existente) {
      turmas.push(existente);
    } else {
      const nova = await prisma.turma.create({
        data: {
          idEscola: t.escola,
          nome: t.nome,
          anoLetivo: t.anoLetivo,
          serie: t.serie,
          turno: t.turno,
        }
      });
      turmas.push(nova);
    }
  }

  console.log(`   ✅ ${turmas.length} turmas criadas/verificadas`);
  return turmas;
}

export async function seedAlunos(prisma: PrismaClient) {
  console.log('👨‍🎓 Criando alunos...');

  // Buscar turmas por nome
  const turma6A = await prisma.turma.findFirst({ where: { nome: '6º Ano A' } });
  const turma6B = await prisma.turma.findFirst({ where: { nome: '6º Ano B' } });
  const turma8A = await prisma.turma.findFirst({ where: { nome: '8º Ano A' } });

  if (!turma6A || !turma6B || !turma8A) {
    console.log('   ⚠️ Turmas não encontradas. Pulando criação de alunos.');
    return [];
  }

  const alunosData = [
    // Turma 6º Ano A - 5 alunos
    { turma: turma6A.id, nome: 'Lucas Silva Santos', matricula: '2025001', email: 'aluno.lucas@sigea.com', dataNascimento: new Date('2013-03-15'), telefone: '(61) 97000-1001' },
    { turma: turma6A.id, nome: 'Maria Eduarda Oliveira', matricula: '2025002', email: 'aluno.maria@sigea.com', dataNascimento: new Date('2013-05-20'), telefone: '(61) 97000-1002' },
    { turma: turma6A.id, nome: 'Pedro Henrique Costa', matricula: '2025003', email: 'pedro.costa@email.com', dataNascimento: new Date('2013-07-10'), telefone: '(61) 97000-1003' },
    { turma: turma6A.id, nome: 'Ana Clara Ferreira', matricula: '2025004', email: 'ana.clara@email.com', dataNascimento: new Date('2013-02-28'), telefone: '(61) 97000-1004' },
    { turma: turma6A.id, nome: 'Gabriel Rodrigues', matricula: '2025005', email: 'gabriel.rodrigues@email.com', dataNascimento: new Date('2013-09-05'), telefone: '(61) 97000-1005' },
    
    // Turma 6º Ano B - 2 alunos
    { turma: turma6B.id, nome: 'Beatriz Almeida', matricula: '2025006', email: 'beatriz.almeida@email.com', dataNascimento: new Date('2013-04-12'), telefone: '(61) 97000-1006' },
    { turma: turma6B.id, nome: 'Matheus Lima', matricula: '2025007', email: 'matheus.lima@email.com', dataNascimento: new Date('2013-06-18'), telefone: '(61) 97000-1007' },
    
    // Turma 8º Ano A (Escola 2) - 2 alunos
    { turma: turma8A.id, nome: 'Daniel Souza', matricula: '2025011', email: 'daniel.souza@email.com', dataNascimento: new Date('2011-08-22'), telefone: '(61) 97000-1011' },
    { turma: turma8A.id, nome: 'Valentina Gomes', matricula: '2025012', email: 'valentina.gomes@email.com', dataNascimento: new Date('2011-11-30'), telefone: '(61) 97000-1012' },
  ];

  const alunos = [];
  for (const a of alunosData) {
    const existente = await prisma.aluno.findUnique({ where: { matricula: a.matricula } });

    if (existente) {
      // Atualizar turma se necessário
      if (existente.idTurma !== a.turma) {
        await prisma.aluno.update({
          where: { matricula: a.matricula },
          data: { idTurma: a.turma }
        });
      }
      alunos.push(existente);
    } else {
      const novo = await prisma.aluno.create({
        data: {
          idTurma: a.turma,
          nome: a.nome,
          matricula: a.matricula,
          email: a.email,
          dataNascimento: a.dataNascimento,
          telefoneResponsavel: a.telefone,
        }
      });
      alunos.push(novo);
    }
  }

  console.log(`   ✅ ${alunos.length} alunos criados/verificados`);
  return alunos;
}
