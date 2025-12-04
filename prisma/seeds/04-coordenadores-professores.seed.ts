/**
 * Seed: Coordenadores e Professores
 */
import { PrismaClient } from '@prisma/client';

export async function seedCoordenadores(prisma: PrismaClient) {
  console.log('👔 Criando coordenadores...');

  const coordenadores = await Promise.all([
    prisma.coordenador.upsert({
      where: { id: 1 },
      update: {},
      create: {
        idEscola: 1,
        nome: 'Maria Aparecida Silva',
        email: 'coord.darcy@sigea.com',
        telefone: '(61) 99999-1111',
      },
    }),
    prisma.coordenador.upsert({
      where: { id: 2 },
      update: {},
      create: {
        idEscola: 2,
        nome: 'José Carlos Souza',
        email: 'coord.anisio@sigea.com',
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
  ]);

  console.log(`   ✅ ${coordenadores.length} coordenadores criados`);
  return coordenadores;
}

export async function seedProfessores(prisma: PrismaClient) {
  console.log('👩‍🏫 Criando professores...');

  const professores = await Promise.all([
    prisma.professor.upsert({
      where: { id: 1 },
      update: {},
      create: {
        idEscola: 1,
        nome: 'Carlos Eduardo Matemática',
        email: 'prof.carlos@sigea.com',
        telefone: '(61) 98888-1111',
      },
    }),
    prisma.professor.upsert({
      where: { id: 2 },
      update: {},
      create: {
        idEscola: 1,
        nome: 'Ana Paula Português',
        email: 'prof.ana@sigea.com',
        telefone: '(61) 98888-2222',
      },
    }),
    prisma.professor.upsert({
      where: { id: 3 },
      update: {},
      create: {
        idEscola: 1,
        nome: 'Paulo Roberto História',
        email: 'prof.paulo@sigea.com',
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
  ]);

  console.log(`   ✅ ${professores.length} professores criados`);
  return professores;
}
