/**
 * ============================================
 * SIGEA Backend - Entry Point
 * ============================================
 * Sistema de Gestão Escolar Acadêmica
 * 
 * Projeto acadêmico - UnB - Banco de Dados 2025.2
 * ============================================
 */

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

// Configurações
import { env, prisma, corsOptions } from './config';

// Documentação Swagger
import { swaggerSpec } from './docs';

// Middlewares
import { errorHandler } from './shared/middlewares';

// Rotas dos módulos
import { authRoutes } from './modules/auth';
import { escolaRoutes } from './modules/escolas';
import { disciplinaRoutes } from './modules/disciplinas';
import { periodoRoutes } from './modules/periodos';
import { coordenadorRoutes } from './modules/coordenadores';
import { professorRoutes } from './modules/professores';
import { turmaRoutes } from './modules/turmas';
import { alunoRoutes } from './modules/alunos';
import { vinculoRoutes } from './modules/vinculos';
import { regraRoutes } from './modules/regras';
import { avaliacaoRoutes } from './modules/avaliacoes';
import { notaRoutes } from './modules/notas';
import { relatorioRoutes } from './modules/relatorios';

// Inicializa Express
const app = express();

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

// CORS
app.use(cors(corsOptions));

// Parse JSON
app.use(express.json());

// Parse URL-encoded
app.use(express.urlencoded({ extended: true }));

// ============================================
// DOCUMENTAÇÃO SWAGGER
// ============================================

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SIGEA API - Documentação',
}));

// Endpoint para JSON da spec OpenAPI
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// ROTAS DA API
// ============================================

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    // Testa conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'SIGEA API está funcionando!',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: env.NODE_ENV,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Problema na conexão com o banco de dados',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// Autenticação
app.use('/api/auth', authRoutes);

// Módulos CRUD
app.use('/api/escolas', escolaRoutes);
app.use('/api/disciplinas', disciplinaRoutes);
app.use('/api/periodos', periodoRoutes);
app.use('/api/coordenadores', coordenadorRoutes);
app.use('/api/professores', professorRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/vinculos', vinculoRoutes);
app.use('/api/regras', regraRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/relatorios', relatorioRoutes);

// ============================================
// ROTA 404
// ============================================

app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Rota não encontrada',
    },
  });
});

// Redireciona raiz para docs
app.get('/', (_req, res) => {
  res.redirect('/api/docs');
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================

app.use(errorHandler);

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================

const startServer = async () => {
  try {
    // Testa conexão com o banco de dados
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');

    // Inicia o servidor
    app.listen(env.PORT, () => {
      console.log('\n============================================');
      console.log('🎓 SIGEA - Sistema de Gestão Escolar Acadêmica');
      console.log('============================================');
      console.log(`📡 Servidor rodando em: http://localhost:${env.PORT}`);
      console.log(`📚 Documentação API: http://localhost:${env.PORT}/api/docs`);
      console.log(`🔧 Ambiente: ${env.NODE_ENV}`);
      console.log('============================================\n');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 Recebido SIGTERM, encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido SIGINT, encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Inicia o servidor
startServer();

export default app;
