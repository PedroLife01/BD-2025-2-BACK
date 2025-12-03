/**
 * ============================================
 * SIGEA Backend - Seed de Dados
 * ============================================
 * Popula o banco de dados com dados de exemplo
 * para testes e desenvolvimento.
 * 
 * Execute com: npm run db:seed
 * ============================================
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const Role = {
  ADMIN: 'ADMIN' as const,
  COORDENADOR: 'COORDENADOR' as const,
  PROFESSOR: 'PROFESSOR' as const,
};

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ========================================
  // 1. USUÁRIOS
  // ========================================
  console.log('👤 Criando usuários...');
  
  const senhaHash = await bcrypt.hash('123456', 10);

  const usuarios = await Promise.all([
    prisma.usuario.upsert({
      where: { email: 'admin@sigea.com' },
      update: {},
      create: {
        nome: 'Administrador do Sistema',
        email: 'admin@sigea.com',
        senhaHash,
        role: Role.ADMIN,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'coordenador@sigea.com' },
      update: {},
      create: {
        nome: 'Maria Coordenadora',
        email: 'coordenador@sigea.com',
        senhaHash,
        role: Role.COORDENADOR,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'professor@sigea.com' },
      update: {},
      create: {
        nome: 'João Professor',
        email: 'professor@sigea.com',
        senhaHash,
        role: Role.PROFESSOR,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'professor2@sigea.com' },
      update: {},
      create: {
        nome: 'Ana Professora',
        email: 'professor2@sigea.com',
        senhaHash,
        role: Role.PROFESSOR,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'professor3@sigea.com' },
      update: {},
      create: {
        nome: 'Carlos Professor',
        email: 'professor3@sigea.com',
        senhaHash,
        role: Role.PROFESSOR,
      },
    }),
  ]);
  console.log(`   ✅ ${usuarios.length} usuários criados`);

  // ========================================
  // 2. ESCOLAS
  // ========================================
  console.log('🏫 Criando escolas...');

  const escolas = await Promise.all([
    prisma.escola.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nome: 'Escola Municipal Darcy Ribeiro',
        cnpj: '12345678000100',
        telefone: '(61) 3333-1111',
        email: 'contato@darcyribeiro.edu.br',
        regiaoAdministrativa: 'Asa Norte - Brasília',
      },
    }),
    prisma.escola.upsert({
      where: { id: 2 },
      update: {},
      create: {
        nome: 'Colégio Estadual Anísio Teixeira',
        cnpj: '98765432000100',
        telefone: '(61) 3333-2222',
        email: 'secretaria@anisioteixeira.edu.br',
        regiaoAdministrativa: 'Taguatinga',
      },
    }),
    prisma.escola.upsert({
      where: { id: 3 },
      update: {},
      create: {
        nome: 'Instituto de Educação Paulo Freire',
        cnpj: '11122233000144',
        telefone: '(61) 3333-3333',
        email: 'instituto@paulofreire.edu.br',
        regiaoAdministrativa: 'Asa Sul - Brasília',
      },
    }),
    prisma.escola.upsert({
      where: { id: 4 },
      update: {},
      create: {
        nome: 'Centro Educacional Maria Montessori',
        cnpj: '55544433000122',
        telefone: '(61) 3333-4444',
        email: 'atendimento@montessori.edu.br',
        regiaoAdministrativa: 'Lago Norte',
      },
    }),
    prisma.escola.upsert({
      where: { id: 5 },
      update: {},
      create: {
        nome: 'Escola Rural Candango',
        cnpj: '99988877000111',
        telefone: '(61) 3333-5555',
        email: 'escola@candango.edu.br',
        regiaoAdministrativa: 'Planaltina',
      },
    }),
  ]);
  console.log(`   ✅ ${escolas.length} escolas criadas`);

  // ========================================
  // 3. DISCIPLINAS
  // ========================================
  console.log('📚 Criando disciplinas...');

  const disciplinas = await Promise.all([
    prisma.disciplina.upsert({
      where: { id: 1 },
      update: {},
      create: { nome: 'Matemática', cargaHoraria: 160, areaConhecimento: 'Exatas' },
    }),
    prisma.disciplina.upsert({
      where: { id: 2 },
      update: {},
      create: { nome: 'Português', cargaHoraria: 160, areaConhecimento: 'Linguagens' },
    }),
    prisma.disciplina.upsert({
      where: { id: 3 },
      update: {},
      create: { nome: 'História', cargaHoraria: 80, areaConhecimento: 'Humanas' },
    }),
    prisma.disciplina.upsert({
      where: { id: 4 },
      update: {},
      create: { nome: 'Geografia', cargaHoraria: 80, areaConhecimento: 'Humanas' },
    }),
    prisma.disciplina.upsert({
      where: { id: 5 },
      update: {},
      create: { nome: 'Ciências', cargaHoraria: 120, areaConhecimento: 'Naturais' },
    }),
    prisma.disciplina.upsert({
      where: { id: 6 },
      update: {},
      create: { nome: 'Física', cargaHoraria: 80, areaConhecimento: 'Exatas' },
    }),
    prisma.disciplina.upsert({
      where: { id: 7 },
      update: {},
      create: { nome: 'Química', cargaHoraria: 80, areaConhecimento: 'Exatas' },
    }),
    prisma.disciplina.upsert({
      where: { id: 8 },
      update: {},
      create: { nome: 'Biologia', cargaHoraria: 80, areaConhecimento: 'Naturais' },
    }),
    prisma.disciplina.upsert({
      where: { id: 9 },
      update: {},
      create: { nome: 'Educação Física', cargaHoraria: 80, areaConhecimento: 'Saúde' },
    }),
    prisma.disciplina.upsert({
      where: { id: 10 },
      update: {},
      create: { nome: 'Artes', cargaHoraria: 40, areaConhecimento: 'Linguagens' },
    }),
  ]);
  console.log(`   ✅ ${disciplinas.length} disciplinas criadas`);

  // ========================================
  // 4. PERÍODOS LETIVOS
  // ========================================
  console.log('📅 Criando períodos letivos...');

  const periodos = await Promise.all([
    prisma.periodoLetivo.upsert({
      where: { id: 1 },
      update: {},
      create: {
        ano: 2025,
        etapa: '1º Bimestre',
        dataInicio: new Date('2025-02-03'),
        dataFim: new Date('2025-04-11'),
      },
    }),
    prisma.periodoLetivo.upsert({
      where: { id: 2 },
      update: {},
      create: {
        ano: 2025,
        etapa: '2º Bimestre',
        dataInicio: new Date('2025-04-21'),
        dataFim: new Date('2025-06-27'),
      },
    }),
    prisma.periodoLetivo.upsert({
      where: { id: 3 },
      update: {},
      create: {
        ano: 2025,
        etapa: '3º Bimestre',
        dataInicio: new Date('2025-08-04'),
        dataFim: new Date('2025-10-03'),
      },
    }),
    prisma.periodoLetivo.upsert({
      where: { id: 4 },
      update: {},
      create: {
        ano: 2025,
        etapa: '4º Bimestre',
        dataInicio: new Date('2025-10-13'),
        dataFim: new Date('2025-12-19'),
      },
    }),
    prisma.periodoLetivo.upsert({
      where: { id: 5 },
      update: {},
      create: {
        ano: 2025,
        etapa: '1º Semestre',
        dataInicio: new Date('2025-02-03'),
        dataFim: new Date('2025-06-27'),
      },
    }),
  ]);
  console.log(`   ✅ ${periodos.length} períodos letivos criados`);

  // ========================================
  // 5. COORDENADORES
  // ========================================
  console.log('👔 Criando coordenadores...');

  const coordenadores = await Promise.all([
    prisma.coordenador.upsert({
      where: { id: 1 },
      update: {},
      create: {
        idEscola: 1,
        nome: 'Maria Aparecida Silva',
        email: 'maria.coordenadora@darcyribeiro.edu.br',
        telefone: '(61) 99999-1111',
      },
    }),
    prisma.coordenador.upsert({
      where: { id: 2 },
      update: {},
      create: {
        idEscola: 2,
        nome: 'José Carlos Souza',
        email: 'jose.coordenador@anisioteixeira.edu.br',
        telefone: '(61) 99999-2222',
      },
    }),
    prisma.coordenador.upsert({
      where: { id: 3 },
      update: {},
      create: {
        idEscola: 3,
        nome: 'Fernanda Oliveira',
        email: 'fernanda@paulofreire.edu.br',
        telefone: '(61) 99999-3333',
      },
    }),
    prisma.coordenador.upsert({
      where: { id: 4 },
      update: {},
      create: {
        idEscola: 4,
        nome: 'Roberto Lima',
        email: 'roberto@montessori.edu.br',
        telefone: '(61) 99999-4444',
      },
    }),
    prisma.coordenador.upsert({
      where: { id: 5 },
      update: {},
      create: {
        idEscola: 5,
        nome: 'Carla Santos',
        email: 'carla@candango.edu.br',
        telefone: '(61) 99999-5555',
      },
    }),
  ]);
  console.log(`   ✅ ${coordenadores.length} coordenadores criados`);

  // ========================================
  // 6. PROFESSORES
  // ========================================
  console.log('👩‍🏫 Criando professores...');

  const professores = await Promise.all([
    prisma.professor.upsert({
      where: { id: 1 },
      update: {},
      create: {
        idEscola: 1,
        nome: 'Carlos Eduardo Matemática',
        email: 'carlos.mat@darcyribeiro.edu.br',
        telefone: '(61) 98888-1111',
      },
    }),
    prisma.professor.upsert({
      where: { id: 2 },
      update: {},
      create: {
        idEscola: 1,
        nome: 'Ana Paula Português',
        email: 'ana.port@darcyribeiro.edu.br',
        telefone: '(61) 98888-2222',
      },
    }),
    prisma.professor.upsert({
      where: { id: 3 },
      update: {},
      create: {
        idEscola: 1,
        nome: 'Paulo Roberto História',
        email: 'paulo.hist@darcyribeiro.edu.br',
        telefone: '(61) 98888-3333',
      },
    }),
    prisma.professor.upsert({
      where: { id: 4 },
      update: {},
      create: {
        idEscola: 2,
        nome: 'Mariana Ciências',
        email: 'mariana.cie@anisioteixeira.edu.br',
        telefone: '(61) 98888-4444',
      },
    }),
    prisma.professor.upsert({
      where: { id: 5 },
      update: {},
      create: {
        idEscola: 2,
        nome: 'Ricardo Geografia',
        email: 'ricardo.geo@anisioteixeira.edu.br',
        telefone: '(61) 98888-5555',
      },
    }),
    prisma.professor.upsert({
      where: { id: 6 },
      update: {},
      create: {
        idEscola: 3,
        nome: 'Juliana Artes',
        email: 'juliana.artes@paulofreire.edu.br',
        telefone: '(61) 98888-6666',
      },
    }),
  ]);
  console.log(`   ✅ ${professores.length} professores criados`);

  // ========================================
  // 7. TURMAS
  // ========================================
  console.log('🎒 Criando turmas...');

  const turmas = await Promise.all([
    prisma.turma.upsert({
      where: { id: 1 },
      update: {},
      create: {
        idEscola: 1,
        nome: '6º Ano A',
        anoLetivo: 2025,
        serie: '6º Ano',
        turno: 'Matutino',
      },
    }),
    prisma.turma.upsert({
      where: { id: 2 },
      update: {},
      create: {
        idEscola: 1,
        nome: '6º Ano B',
        anoLetivo: 2025,
        serie: '6º Ano',
        turno: 'Vespertino',
      },
    }),
    prisma.turma.upsert({
      where: { id: 3 },
      update: {},
      create: {
        idEscola: 1,
        nome: '7º Ano A',
        anoLetivo: 2025,
        serie: '7º Ano',
        turno: 'Matutino',
      },
    }),
    prisma.turma.upsert({
      where: { id: 4 },
      update: {},
      create: {
        idEscola: 2,
        nome: '8º Ano A',
        anoLetivo: 2025,
        serie: '8º Ano',
        turno: 'Matutino',
      },
    }),
    prisma.turma.upsert({
      where: { id: 5 },
      update: {},
      create: {
        idEscola: 2,
        nome: '9º Ano A',
        anoLetivo: 2025,
        serie: '9º Ano',
        turno: 'Matutino',
      },
    }),
    prisma.turma.upsert({
      where: { id: 6 },
      update: {},
      create: {
        idEscola: 3,
        nome: '1º Ano EM',
        anoLetivo: 2025,
        serie: '1º Ensino Médio',
        turno: 'Integral',
      },
    }),
  ]);
  console.log(`   ✅ ${turmas.length} turmas criadas`);

  // ========================================
  // 8. ALUNOS
  // ========================================
  console.log('👨‍🎓 Criando alunos...');

  const alunosData = [
    { idTurma: 1, nome: 'Lucas Silva Santos', matricula: '2025001', email: 'lucas.santos@email.com' },
    { idTurma: 1, nome: 'Maria Eduarda Oliveira', matricula: '2025002', email: 'maria.eduarda@email.com' },
    { idTurma: 1, nome: 'Pedro Henrique Costa', matricula: '2025003', email: 'pedro.costa@email.com' },
    { idTurma: 1, nome: 'Ana Clara Ferreira', matricula: '2025004', email: 'ana.clara@email.com' },
    { idTurma: 1, nome: 'Gabriel Rodrigues', matricula: '2025005', email: 'gabriel.rodrigues@email.com' },
    { idTurma: 2, nome: 'Beatriz Almeida', matricula: '2025006', email: 'beatriz.almeida@email.com' },
    { idTurma: 2, nome: 'Matheus Lima', matricula: '2025007', email: 'matheus.lima@email.com' },
    { idTurma: 2, nome: 'Isabela Martins', matricula: '2025008', email: 'isabela.martins@email.com' },
    { idTurma: 3, nome: 'Gustavo Pereira', matricula: '2025009', email: 'gustavo.pereira@email.com' },
    { idTurma: 3, nome: 'Sophia Nascimento', matricula: '2025010', email: 'sophia.nascimento@email.com' },
    { idTurma: 4, nome: 'Daniel Souza', matricula: '2025011', email: 'daniel.souza@email.com' },
    { idTurma: 4, nome: 'Valentina Gomes', matricula: '2025012', email: 'valentina.gomes@email.com' },
    { idTurma: 5, nome: 'Enzo Santos', matricula: '2025013', email: 'enzo.santos@email.com' },
    { idTurma: 5, nome: 'Laura Ribeiro', matricula: '2025014', email: 'laura.ribeiro@email.com' },
    { idTurma: 6, nome: 'Rafael Mendes', matricula: '2025015', email: 'rafael.mendes@email.com' },
  ];

  const alunos = await Promise.all(
    alunosData.map((aluno, index) =>
      prisma.aluno.upsert({
        where: { matricula: aluno.matricula },
        update: {},
        create: {
          ...aluno,
          dataNascimento: new Date(2010 - Math.floor(index / 3), index % 12, 1 + index),
          telefoneResponsavel: `(61) 9${7000 + index}-${1000 + index}`,
        },
      })
    )
  );
  console.log(`   ✅ ${alunos.length} alunos criados`);

  // ========================================
  // 9. VÍNCULOS TURMA-PROFESSOR (TurmaProfessor)
  // ========================================
  console.log('🔗 Criando vínculos turma-professor...');

  const vinculos = await Promise.all([
    // Turma 1 (6º A) - Escola 1
    prisma.turmaProfessor.upsert({
      where: { id: 1 },
      update: {},
      create: { idTurma: 1, idProfessor: 1, idDisciplina: 1 }, // Matemática
    }),
    prisma.turmaProfessor.upsert({
      where: { id: 2 },
      update: {},
      create: { idTurma: 1, idProfessor: 2, idDisciplina: 2 }, // Português
    }),
    prisma.turmaProfessor.upsert({
      where: { id: 3 },
      update: {},
      create: { idTurma: 1, idProfessor: 3, idDisciplina: 3 }, // História
    }),
    // Turma 2 (6º B) - Escola 1
    prisma.turmaProfessor.upsert({
      where: { id: 4 },
      update: {},
      create: { idTurma: 2, idProfessor: 1, idDisciplina: 1 }, // Matemática
    }),
    prisma.turmaProfessor.upsert({
      where: { id: 5 },
      update: {},
      create: { idTurma: 2, idProfessor: 2, idDisciplina: 2 }, // Português
    }),
    // Turma 4 (8º A) - Escola 2
    prisma.turmaProfessor.upsert({
      where: { id: 6 },
      update: {},
      create: { idTurma: 4, idProfessor: 4, idDisciplina: 5 }, // Ciências
    }),
    prisma.turmaProfessor.upsert({
      where: { id: 7 },
      update: {},
      create: { idTurma: 4, idProfessor: 5, idDisciplina: 4 }, // Geografia
    }),
  ]);
  console.log(`   ✅ ${vinculos.length} vínculos criados`);

  // ========================================
  // 10. REGRAS DE APROVAÇÃO
  // ========================================
  console.log('📋 Criando regras de aprovação...');

  const regras = await Promise.all([
    prisma.regraAprovacao.upsert({
      where: { idEscola_anoLetivo: { idEscola: 1, anoLetivo: 2025 } },
      update: {},
      create: {
        idEscola: 1,
        idCoordenador: 1,
        anoLetivo: 2025,
        mediaMinima: 6.0,
      },
    }),
    prisma.regraAprovacao.upsert({
      where: { idEscola_anoLetivo: { idEscola: 2, anoLetivo: 2025 } },
      update: {},
      create: {
        idEscola: 2,
        idCoordenador: 2,
        anoLetivo: 2025,
        mediaMinima: 5.0,
      },
    }),
    prisma.regraAprovacao.upsert({
      where: { idEscola_anoLetivo: { idEscola: 3, anoLetivo: 2025 } },
      update: {},
      create: {
        idEscola: 3,
        idCoordenador: 3,
        anoLetivo: 2025,
        mediaMinima: 7.0,
      },
    }),
    prisma.regraAprovacao.upsert({
      where: { idEscola_anoLetivo: { idEscola: 4, anoLetivo: 2025 } },
      update: {},
      create: {
        idEscola: 4,
        idCoordenador: 4,
        anoLetivo: 2025,
        mediaMinima: 6.0,
      },
    }),
    prisma.regraAprovacao.upsert({
      where: { idEscola_anoLetivo: { idEscola: 5, anoLetivo: 2025 } },
      update: {},
      create: {
        idEscola: 5,
        idCoordenador: 5,
        anoLetivo: 2025,
        mediaMinima: 5.0,
      },
    }),
  ]);
  console.log(`   ✅ ${regras.length} regras de aprovação criadas`);

  // ========================================
  // 11. AVALIAÇÕES
  // ========================================
  console.log('📝 Criando avaliações...');

  const avaliacoes = await Promise.all([
    // Matemática - Turma 1
    prisma.avaliacao.upsert({
      where: { id: 1 },
      update: {},
      create: {
        idTurmaProfessor: 1,
        idPeriodoLetivo: 1,
        titulo: 'Prova 1 - Números Inteiros',
        tipo: 'Prova',
        dataAplicacao: new Date('2025-03-15'),
        peso: 2.0,
      },
    }),
    prisma.avaliacao.upsert({
      where: { id: 2 },
      update: {},
      create: {
        idTurmaProfessor: 1,
        idPeriodoLetivo: 1,
        titulo: 'Trabalho - Operações',
        tipo: 'Trabalho',
        dataAplicacao: new Date('2025-03-28'),
        peso: 1.0,
      },
    }),
    // Português - Turma 1
    prisma.avaliacao.upsert({
      where: { id: 3 },
      update: {},
      create: {
        idTurmaProfessor: 2,
        idPeriodoLetivo: 1,
        titulo: 'Prova 1 - Interpretação de Texto',
        tipo: 'Prova',
        dataAplicacao: new Date('2025-03-18'),
        peso: 2.0,
      },
    }),
    prisma.avaliacao.upsert({
      where: { id: 4 },
      update: {},
      create: {
        idTurmaProfessor: 2,
        idPeriodoLetivo: 1,
        titulo: 'Redação',
        tipo: 'Redação',
        dataAplicacao: new Date('2025-04-01'),
        peso: 1.5,
      },
    }),
    // História - Turma 1
    prisma.avaliacao.upsert({
      where: { id: 5 },
      update: {},
      create: {
        idTurmaProfessor: 3,
        idPeriodoLetivo: 1,
        titulo: 'Prova 1 - Brasil Colonial',
        tipo: 'Prova',
        dataAplicacao: new Date('2025-03-20'),
        peso: 2.0,
      },
    }),
  ]);
  console.log(`   ✅ ${avaliacoes.length} avaliações criadas`);

  // ========================================
  // 12. NOTAS
  // ========================================
  console.log('📊 Lançando notas...');

  // Buscar avaliações com informações de turma
  const avaliacoesComTurma = await prisma.avaliacao.findMany({
    include: {
      turmaProfessor: true,
    },
  });

  const notasData: { idAvaliacao: number; idAluno: number; notaObtida: number }[] = [];

  // Para cada avaliação, buscar os alunos da turma correspondente e criar notas
  for (const avaliacao of avaliacoesComTurma) {
    const alunosDaTurma = await prisma.aluno.findMany({
      where: { idTurma: avaliacao.turmaProfessor.idTurma },
    });

    for (const aluno of alunosDaTurma) {
      notasData.push({
        idAvaliacao: avaliacao.id,
        idAluno: aluno.id,
        notaObtida: Math.round((5 + Math.random() * 5) * 10) / 10, // Nota entre 5.0 e 10.0
      });
    }
  }

  const notas = await Promise.all(
    notasData.map((nota, index) =>
      prisma.nota.upsert({
        where: { id: index + 1 },
        update: {},
        create: nota,
      })
    )
  );
  console.log(`   ✅ ${notas.length} notas lançadas`);

  // ========================================
  // RESUMO FINAL
  // ========================================
  console.log('\n✨ Seed concluído com sucesso!\n');
  console.log('📊 Resumo dos dados criados:');
  console.log(`   - ${usuarios.length} usuários`);
  console.log(`   - ${escolas.length} escolas`);
  console.log(`   - ${disciplinas.length} disciplinas`);
  console.log(`   - ${periodos.length} períodos letivos`);
  console.log(`   - ${coordenadores.length} coordenadores`);
  console.log(`   - ${professores.length} professores`);
  console.log(`   - ${turmas.length} turmas`);
  console.log(`   - ${alunos.length} alunos`);
  console.log(`   - ${vinculos.length} vínculos turma-professor`);
  console.log(`   - ${regras.length} regras de aprovação`);
  console.log(`   - ${avaliacoes.length} avaliações`);
  console.log(`   - ${notas.length} notas`);
  console.log('\n🔐 Credenciais de acesso (senha: 123456):');
  console.log('   - Admin: admin@sigea.com');
  console.log('   - Coordenador: coordenador@sigea.com');
  console.log('   - Professor: professor@sigea.com');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
