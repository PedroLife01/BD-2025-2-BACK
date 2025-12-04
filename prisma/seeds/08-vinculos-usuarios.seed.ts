/**
 * Seed: Vincula usuários às entidades (professor, coordenador, aluno)
 */
import { PrismaClient } from '@prisma/client';

export async function seedVinculosUsuarios(prisma: PrismaClient) {
  console.log('🔐 Vinculando usuários às entidades...');

  // Vincular coordenadores
  await prisma.usuario.update({
    where: { email: 'coord.darcy@sigea.com' },
    data: { idCoordenador: 1 },
  });
  await prisma.usuario.update({
    where: { email: 'coord.anisio@sigea.com' },
    data: { idCoordenador: 2 },
  });

  // Vincular professores
  await prisma.usuario.update({
    where: { email: 'prof.carlos@sigea.com' },
    data: { idProfessor: 1 },
  });
  await prisma.usuario.update({
    where: { email: 'prof.ana@sigea.com' },
    data: { idProfessor: 2 },
  });
  await prisma.usuario.update({
    where: { email: 'prof.paulo@sigea.com' },
    data: { idProfessor: 3 },
  });

  // Vincular alunos
  const lucas = await prisma.aluno.findUnique({ where: { matricula: '2025001' } });
  const maria = await prisma.aluno.findUnique({ where: { matricula: '2025002' } });

  if (lucas) {
    await prisma.usuario.update({
      where: { email: 'aluno.lucas@sigea.com' },
      data: { idAluno: lucas.id },
    });
  }
  if (maria) {
    await prisma.usuario.update({
      where: { email: 'aluno.maria@sigea.com' },
      data: { idAluno: maria.id },
    });
  }

  console.log('   ✅ Vínculos de usuários criados');
}
