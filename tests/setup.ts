import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Carrega variáveis de ambiente
config();

// Mock do console.log durante testes
global.console.log = jest.fn();

// Exporta instância do Prisma para testes
export const prisma = new PrismaClient();

// Limpa conexão após todos os testes
afterAll(async () => {
  await prisma.$disconnect();
});
