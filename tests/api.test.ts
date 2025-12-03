/**
 * ============================================
 * SIGEA Backend - Testes de Integração da API
 * ============================================
 * Testes automatizados para todos os endpoints
 * 
 * IMPORTANTE: O servidor deve estar rodando
 * Execute: npm run dev (em outro terminal)
 * Depois: npm test
 */

import request from 'supertest';
import { prisma } from './setup';

// URL base da API (servidor deve estar rodando)
const BASE_URL = 'http://localhost:3000';

// Token de autenticação para testes
let authToken: string;

describe('SIGEA API Tests', () => {
  // ========================================
  // Autenticação
  // ========================================
  describe('Auth Module', () => {
    describe('POST /api/auth/login', () => {
      it('deve fazer login com credenciais válidas', async () => {
        const response = await request(BASE_URL)
          .post('/api/auth/login')
          .send({ email: 'admin@sigea.com', senha: '123456' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data.user).toHaveProperty('email', 'admin@sigea.com');
        
        // Salva token para próximos testes
        authToken = response.body.data.token;
      });

      it('deve rejeitar credenciais inválidas', async () => {
        const response = await request(BASE_URL)
          .post('/api/auth/login')
          .send({ email: 'admin@sigea.com', senha: 'senhaerrada' });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('deve rejeitar email inexistente', async () => {
        const response = await request(BASE_URL)
          .post('/api/auth/login')
          .send({ email: 'naoexiste@sigea.com', senha: '123456' });

        expect(response.status).toBe(401); // Unauthorized (não revela se email existe)
        expect(response.body.success).toBe(false);
      });

      it('deve validar campos obrigatórios', async () => {
        const response = await request(BASE_URL)
          .post('/api/auth/login')
          .send({ email: 'admin@sigea.com' }); // Sem senha

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  // ========================================
  // Escolas
  // ========================================
  describe('Escolas Module', () => {
    describe('GET /api/escolas', () => {
      it('deve listar escolas com autenticação', async () => {
        const response = await request(BASE_URL)
          .get('/api/escolas')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.pagination).toBeDefined();
      });

      it('deve rejeitar sem autenticação', async () => {
        const response = await request(BASE_URL)
          .get('/api/escolas');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('deve suportar paginação', async () => {
        const response = await request(BASE_URL)
          .get('/api/escolas?page=1&limit=2')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeLessThanOrEqual(2);
        expect(response.body.pagination.limit).toBe(2);
      });

      it('deve suportar busca por nome', async () => {
        const response = await request(BASE_URL)
          .get('/api/escolas?search=Maria')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/escolas/:id', () => {
      it('deve retornar escola específica', async () => {
        const response = await request(BASE_URL)
          .get('/api/escolas/1')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', 1);
      });

      it('deve retornar 404 para escola inexistente', async () => {
        const response = await request(BASE_URL)
          .get('/api/escolas/99999')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/escolas', () => {
      let createdId: number;

      it('deve criar nova escola', async () => {
        const novaEscola = {
          nome: 'Escola Teste Jest',
          cnpj: '12345678901234',
          telefone: '(61) 99999-9999',
          email: 'teste@escola.com',
          regiaoAdministrativa: 'Asa Sul',
        };

        const response = await request(BASE_URL)
          .post('/api/escolas')
          .set('Authorization', `Bearer ${authToken}`)
          .send(novaEscola);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('nome', 'Escola Teste Jest');

        createdId = response.body.data?.id;
      });

      afterAll(async () => {
        // Limpa escola criada
        if (createdId) {
          await prisma.escola.delete({ where: { id: createdId } }).catch(() => {});
        }
      });

      it('deve validar campos obrigatórios', async () => {
        const response = await request(BASE_URL)
          .post('/api/escolas')
          .set('Authorization', `Bearer ${authToken}`)
          .send({}); // Sem dados

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  // ========================================
  // Alunos
  // ========================================
  describe('Alunos Module', () => {
    describe('GET /api/alunos', () => {
      it('deve listar alunos', async () => {
        const response = await request(BASE_URL)
          .get('/api/alunos')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('deve suportar busca por nome', async () => {
        const response = await request(BASE_URL)
          .get('/api/alunos?search=Lucas')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/alunos/:id', () => {
      it('deve retornar aluno específico', async () => {
        const response = await request(BASE_URL)
          .get('/api/alunos/1')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', 1);
      });

      it('deve retornar 404 para aluno inexistente', async () => {
        const response = await request(BASE_URL)
          .get('/api/alunos/99999')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });
  });

  // ========================================
  // Turmas
  // ========================================
  describe('Turmas Module', () => {
    describe('GET /api/turmas', () => {
      it('deve listar turmas', async () => {
        const response = await request(BASE_URL)
          .get('/api/turmas')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/turmas/:id', () => {
      it('deve retornar turma com escola', async () => {
        const response = await request(BASE_URL)
          .get('/api/turmas/1')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('escola');
      });
    });
  });

  // ========================================
  // Professores
  // ========================================
  describe('Professores Module', () => {
    describe('GET /api/professores', () => {
      it('deve listar professores', async () => {
        const response = await request(BASE_URL)
          .get('/api/professores')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  // ========================================
  // Disciplinas
  // ========================================
  describe('Disciplinas Module', () => {
    describe('GET /api/disciplinas', () => {
      it('deve listar disciplinas', async () => {
        const response = await request(BASE_URL)
          .get('/api/disciplinas')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  // ========================================
  // Avaliações
  // ========================================
  describe('Avaliacoes Module', () => {
    describe('GET /api/avaliacoes', () => {
      it('deve listar avaliações', async () => {
        const response = await request(BASE_URL)
          .get('/api/avaliacoes')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  // ========================================
  // Notas
  // ========================================
  describe('Notas Module', () => {
    describe('GET /api/notas', () => {
      it('deve listar notas', async () => {
        const response = await request(BASE_URL)
          .get('/api/notas')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });
});

// ========================================
// Testes do Banco de Dados (SQL Objects)
// ========================================
describe('SQL Objects Tests', () => {
  describe('VIEW vw_boletim_aluno', () => {
    it('deve retornar dados do boletim', async () => {
      const result = await prisma.$queryRaw<any[]>`
        SELECT * FROM vw_boletim_aluno LIMIT 5
      `;
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('FUNCTION sp_calcular_media_final', () => {
    it('deve calcular média final do aluno', async () => {
      // Busca um aluno e disciplina existentes
      const aluno = await prisma.aluno.findFirst();
      const disciplina = await prisma.disciplina.findFirst();

      if (aluno && disciplina) {
        const result = await prisma.$queryRaw<any[]>`
          SELECT * FROM sp_calcular_media_final(${aluno.id}::INTEGER, ${disciplina.id}::INTEGER)
        `;
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('FUNCTION fn_gerar_relatorio_turma', () => {
    it('deve gerar relatório de turma', async () => {
      const turma = await prisma.turma.findFirst();

      if (turma) {
        const result = await prisma.$queryRaw<any[]>`
          SELECT * FROM fn_gerar_relatorio_turma(${turma.id}::INTEGER)
        `;
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('TRIGGER trg_validar_nota', () => {
    it('deve rejeitar nota fora do intervalo 0-10', async () => {
      const avaliacao = await prisma.avaliacao.findFirst({
        include: { turmaProfessor: true },
      });
      const aluno = await prisma.aluno.findFirst({
        where: { idTurma: avaliacao?.turmaProfessor?.idTurma },
      });

      if (avaliacao && aluno) {
        await expect(
          prisma.$executeRaw`
            INSERT INTO nota (id_avaliacao, id_aluno, nota_obtida)
            VALUES (${avaliacao.id}, ${aluno.id}, 15)
          `
        ).rejects.toThrow();
      }
    });
  });
});
