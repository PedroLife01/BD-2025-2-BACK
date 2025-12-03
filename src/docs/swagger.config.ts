/**
 * ============================================
 * SIGEA Backend - Configuração do Swagger
 * ============================================
 * Documentação automática da API REST
 * Interface interativa para testar endpoints
 * ============================================
 */

import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import { config } from '../config';

/**
 * Definição do documento Swagger/OpenAPI
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SIGEA API',
    version: '1.0.0',
    description: `
# Sistema de Gestão Escolar Acadêmica (SIGEA)

API REST para gerenciamento de escolas, turmas, alunos, professores, avaliações e notas.

## Funcionalidades

- **Autenticação**: Login e registro com JWT
- **Escolas**: CRUD completo de escolas
- **Coordenadores**: Gestão de coordenadores pedagógicos
- **Professores**: Cadastro e vínculo com turmas
- **Turmas**: Organização de classes por ano/série
- **Alunos**: Matrícula e dados dos estudantes
- **Disciplinas**: Componentes curriculares
- **Períodos**: Bimestres/semestres letivos
- **Vínculos**: Relação professor-turma-disciplina
- **Avaliações**: Provas e trabalhos (com upload de PDF)
- **Notas**: Lançamento e consulta de notas
- **Regras**: Critérios de aprovação

## Autenticação

A maioria dos endpoints requer autenticação via JWT Bearer Token.
Faça login em \`POST /api/auth/login\` e use o token retornado no header:

\`\`\`
Authorization: Bearer <seu_token_aqui>
\`\`\`

## Projeto

Desenvolvido para a disciplina de Banco de Dados - UnB 2025.2
    `,
    contact: {
      name: 'Grupo BD 2025.2',
      email: 'contato@unb.br',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.server.port}`,
      description: 'Servidor de Desenvolvimento',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Autenticação e autorização' },
    { name: 'Escolas', description: 'Gestão de escolas' },
    { name: 'Coordenadores', description: 'Gestão de coordenadores' },
    { name: 'Professores', description: 'Gestão de professores' },
    { name: 'Turmas', description: 'Gestão de turmas' },
    { name: 'Alunos', description: 'Gestão de alunos' },
    { name: 'Disciplinas', description: 'Gestão de disciplinas' },
    { name: 'Períodos', description: 'Gestão de períodos letivos' },
    { name: 'Vínculos', description: 'Vínculo professor-turma-disciplina' },
    { name: 'Avaliações', description: 'Gestão de avaliações e upload de arquivos' },
    { name: 'Notas', description: 'Lançamento e consulta de notas' },
    { name: 'Regras', description: 'Regras de aprovação' },
    { name: 'Boletim', description: 'Consulta de boletim escolar (VIEW)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido no login',
      },
    },
    schemas: {
      // ====== SCHEMAS DE ERRO ======
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Mensagem de erro' },
          error: { type: 'string', example: 'ERROR_CODE' },
          details: { type: 'object', nullable: true },
        },
      },

      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Erro de validação dos dados' },
          error: { type: 'string', example: 'VALIDATION_ERROR' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Email inválido' },
              },
            },
          },
        },
      },

      // ====== SCHEMAS DE AUTENTICAÇÃO ======
      LoginRequest: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@sigea.com' },
          senha: { type: 'string', minLength: 6, example: 'senha123' },
        },
      },

      RegisterRequest: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', example: 'João da Silva' },
          email: { type: 'string', format: 'email', example: 'joao@escola.com' },
          senha: { type: 'string', minLength: 6, example: 'senha123' },
          role: { type: 'string', enum: ['ADMIN', 'COORDENADOR', 'PROFESSOR'], default: 'PROFESSOR' },
        },
      },

      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login realizado com sucesso' },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'integer', example: 1 },
                  nome: { type: 'string', example: 'João da Silva' },
                  email: { type: 'string', example: 'joao@escola.com' },
                  role: { type: 'string', example: 'PROFESSOR' },
                },
              },
            },
          },
        },
      },

      // ====== SCHEMAS DE ENTIDADES ======
      Escola: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Escola Municipal Centro' },
          cnpj: { type: 'string', example: '12345678000199' },
          telefone: { type: 'string', example: '(61) 3333-4444' },
          email: { type: 'string', example: 'contato@escolacentro.edu.br' },
          regiaoAdministrativa: { type: 'string', example: 'Plano Piloto' },
        },
      },

      EscolaInput: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: { type: 'string', example: 'Escola Municipal Centro' },
          cnpj: { type: 'string', example: '12345678000199' },
          telefone: { type: 'string', example: '(61) 3333-4444' },
          email: { type: 'string', example: 'contato@escolacentro.edu.br' },
          regiaoAdministrativa: { type: 'string', example: 'Plano Piloto' },
        },
      },

      Coordenador: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          idEscola: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Maria Santos' },
          email: { type: 'string', example: 'maria@escola.com' },
          telefone: { type: 'string', example: '(61) 99999-0000' },
          escola: { $ref: '#/components/schemas/Escola' },
        },
      },

      Professor: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          idEscola: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Carlos Oliveira' },
          email: { type: 'string', example: 'carlos@escola.com' },
          telefone: { type: 'string', example: '(61) 98888-0000' },
          escola: { $ref: '#/components/schemas/Escola' },
        },
      },

      Turma: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          idEscola: { type: 'integer', example: 1 },
          nome: { type: 'string', example: '9º Ano A' },
          anoLetivo: { type: 'integer', example: 2025 },
          serie: { type: 'string', example: '9º Ano' },
          turno: { type: 'string', example: 'Matutino' },
          escola: { $ref: '#/components/schemas/Escola' },
        },
      },

      Aluno: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          idTurma: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Pedro Alves' },
          matricula: { type: 'string', example: '2025001' },
          dataNascimento: { type: 'string', format: 'date', example: '2010-05-15' },
          email: { type: 'string', example: 'pedro@email.com' },
          telefoneResponsavel: { type: 'string', example: '(61) 97777-0000' },
          turma: { $ref: '#/components/schemas/Turma' },
        },
      },

      Disciplina: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Matemática' },
          cargaHoraria: { type: 'integer', example: 120 },
          areaConhecimento: { type: 'string', example: 'Ciências Exatas' },
        },
      },

      PeriodoLetivo: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          ano: { type: 'integer', example: 2025 },
          etapa: { type: 'string', example: '1º Bimestre' },
          dataInicio: { type: 'string', format: 'date', example: '2025-02-01' },
          dataFim: { type: 'string', format: 'date', example: '2025-04-15' },
        },
      },

      TurmaProfessor: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          idTurma: { type: 'integer', example: 1 },
          idProfessor: { type: 'integer', example: 1 },
          idDisciplina: { type: 'integer', example: 1 },
          turma: { $ref: '#/components/schemas/Turma' },
          professor: { $ref: '#/components/schemas/Professor' },
          disciplina: { $ref: '#/components/schemas/Disciplina' },
        },
      },

      Avaliacao: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          idTurmaProfessor: { type: 'integer', example: 1 },
          idPeriodoLetivo: { type: 'integer', example: 1 },
          titulo: { type: 'string', example: 'Prova 1 - Equações' },
          tipo: { type: 'string', example: 'Prova' },
          dataAplicacao: { type: 'string', format: 'date', example: '2025-03-15' },
          peso: { type: 'number', example: 2.0 },
          nomeArquivo: { type: 'string', example: 'prova1_equacoes.pdf', nullable: true },
        },
      },

      Nota: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          idAvaliacao: { type: 'integer', example: 1 },
          idAluno: { type: 'integer', example: 1 },
          notaObtida: { type: 'number', example: 8.5 },
          dataLancamento: { type: 'string', format: 'date', example: '2025-03-20' },
          avaliacao: { $ref: '#/components/schemas/Avaliacao' },
          aluno: { $ref: '#/components/schemas/Aluno' },
        },
      },

      RegraAprovacao: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          idEscola: { type: 'integer', example: 1 },
          idCoordenador: { type: 'integer', example: 1 },
          anoLetivo: { type: 'integer', example: 2025 },
          mediaMinima: { type: 'number', example: 6.0 },
          escola: { $ref: '#/components/schemas/Escola' },
          coordenador: { $ref: '#/components/schemas/Coordenador' },
        },
      },

      // ====== SCHEMA DO BOLETIM (VIEW) ======
      Boletim: {
        type: 'object',
        properties: {
          alunoId: { type: 'integer', example: 1 },
          alunoNome: { type: 'string', example: 'Pedro Alves' },
          turma: { type: 'string', example: '9º Ano A' },
          disciplina: { type: 'string', example: 'Matemática' },
          periodo: { type: 'string', example: '1º Bimestre' },
          mediaNotas: { type: 'number', example: 7.5 },
          situacao: { type: 'string', example: 'Aprovado' },
        },
      },

      // ====== SCHEMAS DE PAGINAÇÃO ======
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: {} },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              total: { type: 'integer', example: 100 },
              totalPages: { type: 'integer', example: 10 },
            },
          },
        },
      },
    },

    responses: {
      Unauthorized: {
        description: 'Token não fornecido ou inválido',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Token de autenticação não fornecido',
              error: 'MISSING_TOKEN',
            },
          },
        },
      },
      Forbidden: {
        description: 'Sem permissão para acessar o recurso',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Recurso não encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      ValidationError: {
        description: 'Erro de validação dos dados',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ValidationError' },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

/**
 * Opções do swagger-jsdoc
 */
const swaggerOptions: Options = {
  definition: swaggerDefinition,
  // Caminhos para arquivos com anotações JSDoc
  apis: [
    './src/modules/**/*.routes.ts',
    './src/modules/**/*.controller.ts',
  ],
};

/**
 * Especificação Swagger gerada
 */
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
