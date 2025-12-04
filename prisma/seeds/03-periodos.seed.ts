/**
 * Seed: Períodos Letivos
 */
import { PrismaClient } from '@prisma/client';

export async function seedPeriodosLetivos(prisma: PrismaClient) {
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
  ]);

  console.log(`   ✅ ${periodos.length} períodos letivos criados`);
  return periodos;
}
