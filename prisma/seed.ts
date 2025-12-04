/**
 * ============================================
 * SIGEA Backend - Seed Principal
 * ============================================
 * Orquestra todos os seeds modulares.
 * Execute com: npm run db:seed
 * ============================================
 */

import { PrismaClient } from '@prisma/client';
import { seedUsuarios } from './seeds/01-usuarios.seed';
import { seedEscolas, seedDisciplinas } from './seeds/02-escolas-disciplinas.seed';
import { seedPeriodosLetivos } from './seeds/03-periodos.seed';
import { seedCoordenadores, seedProfessores } from './seeds/04-coordenadores-professores.seed';
import { seedTurmas, seedAlunos } from './seeds/05-turmas-alunos.seed';
import { seedVinculos, seedRegrasAprovacao } from './seeds/06-vinculos-regras.seed';
import { seedAvaliacoes, seedNotas } from './seeds/07-avaliacoes-notas.seed';
import { seedVinculosUsuarios } from './seeds/08-vinculos-usuarios.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // 1. Usuários
  await seedUsuarios(prisma);

  // 2. Escolas e Disciplinas
  await seedEscolas(prisma);
  await seedDisciplinas(prisma);

  // 3. Períodos Letivos
  await seedPeriodosLetivos(prisma);

  // 4. Coordenadores e Professores
  await seedCoordenadores(prisma);
  await seedProfessores(prisma);

  // 5. Turmas e Alunos
  await seedTurmas(prisma);
  await seedAlunos(prisma);

  // 6. Vínculos e Regras
  await seedVinculos(prisma);
  await seedRegrasAprovacao(prisma);

  // 7. Avaliações e Notas
  await seedAvaliacoes(prisma);
  await seedNotas(prisma);

  // 8. Vincular usuários às entidades
  await seedVinculosUsuarios(prisma);

  // Resumo
  console.log('\n✨ Seed concluído com sucesso!\n');
  console.log('🔐 Credenciais de acesso (senha: 123456):');
  console.log('   - Admin: admin@sigea.com');
  console.log('   - Coord Darcy: coord.darcy@sigea.com');
  console.log('   - Coord Anísio: coord.anisio@sigea.com');
  console.log('   - Prof Carlos: prof.carlos@sigea.com');
  console.log('   - Prof Ana: prof.ana@sigea.com');
  console.log('   - Prof Paulo: prof.paulo@sigea.com');
  console.log('   - Aluno Lucas: aluno.lucas@sigea.com');
  console.log('   - Aluno Maria: aluno.maria@sigea.com');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

