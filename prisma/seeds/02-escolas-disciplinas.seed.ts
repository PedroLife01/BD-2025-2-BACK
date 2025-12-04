/**
 * Seed: Escolas e Disciplinas
 */
import { PrismaClient } from '@prisma/client';

export async function seedEscolas(prisma: PrismaClient) {
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
        nome: 'Instituto Paulo Freire',
        cnpj: '11122233000144',
        telefone: '(61) 3333-3333',
        email: 'instituto@paulofreire.edu.br',
        regiaoAdministrativa: 'Asa Sul - Brasília',
      },
    }),
  ]);

  console.log(`   ✅ ${escolas.length} escolas criadas`);
  return escolas;
}

export async function seedDisciplinas(prisma: PrismaClient) {
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
  ]);

  console.log(`   ✅ ${disciplinas.length} disciplinas criadas`);
  return disciplinas;
}
