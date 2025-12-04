/**
 * Seed: Usuários do Sistema
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsuarios(prisma: PrismaClient) {
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
        role: 'ADMIN',
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'coord.darcy@sigea.com' },
      update: {},
      create: {
        nome: 'Maria Aparecida Silva',
        email: 'coord.darcy@sigea.com',
        senhaHash,
        role: 'COORDENADOR',
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'coord.anisio@sigea.com' },
      update: {},
      create: {
        nome: 'José Carlos Souza',
        email: 'coord.anisio@sigea.com',
        senhaHash,
        role: 'COORDENADOR',
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'prof.carlos@sigea.com' },
      update: {},
      create: {
        nome: 'Carlos Eduardo Matemática',
        email: 'prof.carlos@sigea.com',
        senhaHash,
        role: 'PROFESSOR',
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'prof.ana@sigea.com' },
      update: {},
      create: {
        nome: 'Ana Paula Português',
        email: 'prof.ana@sigea.com',
        senhaHash,
        role: 'PROFESSOR',
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'prof.paulo@sigea.com' },
      update: {},
      create: {
        nome: 'Paulo Roberto História',
        email: 'prof.paulo@sigea.com',
        senhaHash,
        role: 'PROFESSOR',
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'aluno.lucas@sigea.com' },
      update: {},
      create: {
        nome: 'Lucas Silva Santos',
        email: 'aluno.lucas@sigea.com',
        senhaHash,
        role: 'ALUNO',
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'aluno.maria@sigea.com' },
      update: {},
      create: {
        nome: 'Maria Eduarda Oliveira',
        email: 'aluno.maria@sigea.com',
        senhaHash,
        role: 'ALUNO',
      },
    }),
  ]);

  console.log(`   ✅ ${usuarios.length} usuários criados`);
  return usuarios;
}
