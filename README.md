# 🎓 SIGEA Backend

**Sistema de Gestão Escolar Acadêmica** - Backend Node.js + PostgreSQL

> Projeto acadêmico - UnB - Banco de Dados 2025.2

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando](#-executando)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Banco de Dados](#-banco-de-dados)
- [Objetos SQL](#-objetos-sql)

## 🎯 Visão Geral

O SIGEA é um sistema de gestão escolar que permite:
- Gerenciar escolas, turmas e alunos
- Cadastrar professores e disciplinas
- Vincular professores a turmas e disciplinas
- Criar avaliações com upload de PDF da prova
- Lançar notas e calcular médias
- Definir regras de aprovação por escola

## 🛠 Tecnologias

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL 17
- **Validação:** Zod
- **Autenticação:** JWT + bcrypt
- **Documentação:** Swagger (OpenAPI 3.0)
- **Upload:** Multer (memory storage → BYTEA)

## 📦 Pré-requisitos

- Node.js 20 ou superior
- PostgreSQL 17 (ou compatível)
- npm ou yarn

## 🚀 Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd BD-2025-2-BACK

# Instale as dependências
npm install
```

## ⚙️ Configuração

1. **Crie o arquivo `.env`** baseado no `.env.example`:

```bash
cp .env.example .env
```

2. **Configure as variáveis de ambiente**:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sigea
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:4200
```

3. **Crie o banco de dados**:

```bash
createdb sigea
# ou via psql
psql -c "CREATE DATABASE sigea;"
```

## 🏃 Executando

```bash
# Gera o cliente Prisma
npm run prisma:generate

# Aplica as migrações do banco
npm run db:migrate

# Executa os objetos SQL (VIEW, PROCEDURE, TRIGGER)
npm run db:sql

# Popula o banco com dados de exemplo
npm run db:seed

# Inicia em modo desenvolvimento (com hot-reload)
npm run dev

# Ou para produção
npm run build
npm start
```

### Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor com hot-reload |
| `npm run build` | Compila TypeScript |
| `npm start` | Inicia servidor compilado |
| `npm run prisma:generate` | Gera cliente Prisma |
| `npm run db:migrate` | Aplica migrações |
| `npm run db:seed` | Popula banco com dados |
| `npm run db:studio` | Abre Prisma Studio |

## 📁 Estrutura do Projeto

```
BD-2025-2-BACK/
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   ├── migrations/          # Migrações SQL
│   │   └── sql_objects.sql  # VIEW, PROCEDURE, TRIGGER
│   └── seed.ts              # Script de seed
├── src/
│   ├── config/              # Configurações (env, db, cors)
│   ├── shared/
│   │   ├── middlewares/     # Auth, upload, error handling
│   │   └── utils/           # Helpers (pagination, etc)
│   ├── docs/                # Swagger/OpenAPI config
│   └── modules/
│       ├── auth/            # Autenticação (login, register)
│       ├── escolas/         # CRUD escolas
│       ├── disciplinas/     # CRUD disciplinas
│       ├── periodos/        # CRUD períodos letivos
│       ├── coordenadores/   # CRUD coordenadores
│       ├── professores/     # CRUD professores
│       ├── turmas/          # CRUD turmas
│       ├── alunos/          # CRUD alunos
│       ├── vinculos/        # CRUD turma-professor
│       ├── regras/          # CRUD regras aprovação
│       ├── avaliacoes/      # CRUD + upload PDF
│       └── notas/           # CRUD notas
├── .env                     # Variáveis de ambiente
├── .env.example             # Template das variáveis
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Documentação Interativa

Acesse: `http://localhost:3000/api/docs`

### Principais Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Login (retorna JWT) |
| GET | `/api/auth/profile` | Perfil do usuário logado |
| CRUD | `/api/escolas` | Escolas |
| CRUD | `/api/disciplinas` | Disciplinas |
| CRUD | `/api/periodos` | Períodos letivos |
| CRUD | `/api/coordenadores` | Coordenadores |
| CRUD | `/api/professores` | Professores |
| CRUD | `/api/turmas` | Turmas |
| CRUD | `/api/alunos` | Alunos |
| CRUD | `/api/vinculos` | Vínculos turma-professor |
| CRUD | `/api/regras` | Regras de aprovação |
| CRUD | `/api/avaliacoes` | Avaliações (com upload PDF) |
| CRUD | `/api/notas` | Notas |

### Autenticação

Todas as rotas (exceto login/register) requerem token JWT:

```bash
curl -H "Authorization: Bearer <seu-token>" http://localhost:3000/api/escolas
```

### Credenciais de Teste (após seed)

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@sigea.com | 123456 |
| Coordenador | coordenador@sigea.com | 123456 |
| Professor | professor@sigea.com | 123456 |
| Secretário | secretario@sigea.com | 123456 |
| Aluno | aluno@sigea.com | 123456 |

## 🗄 Banco de Dados

### Diagrama de Entidades

```
Usuario (auth)
Escola ─┬─ Coordenador
        ├─ Professor
        └─ Turma ─┬─ Aluno ─── Nota
                  │            ↑
                  └─ TurmaProfessor ─── Avaliação (+ arquivoProva BYTEA)
                       ↑
                  Disciplina
                       
PeriodoLetivo ─── Avaliação
RegraAprovacao ← Escola + Coordenador
```

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `usuario` | Usuários do sistema (autenticação) |
| `escola` | Escolas cadastradas |
| `coordenador` | Coordenadores pedagógicos |
| `professor` | Professores |
| `turma` | Turmas de cada escola |
| `aluno` | Alunos matriculados |
| `disciplina` | Disciplinas oferecidas |
| `periodo_letivo` | Bimestres/semestres |
| `turma_professor` | Vínculo turma-professor-disciplina |
| `avaliacao` | Avaliações com PDF da prova |
| `nota` | Notas dos alunos |
| `regra_aprovacao` | Regras de aprovação por escola |

## 📊 Objetos SQL

### VIEW: `vw_boletim_aluno`

Retorna o boletim completo do aluno com todas as notas e médias.

```sql
SELECT * FROM vw_boletim_aluno WHERE id_aluno = 1;
```

### PROCEDURE: `sp_calcular_media_final`

Calcula a média final ponderada de um aluno em uma disciplina.

```sql
SELECT * FROM sp_calcular_media_final(1, 1);
-- Retorna: nome_aluno, matricula, nome_disciplina, total_avaliacoes, 
--          soma_pesos, media_final, situacao (APROVADO/REPROVADO)
```

### TRIGGER: `trg_validar_nota`

Validações automáticas ao inserir/atualizar notas:
- Nota deve estar entre 0 e 10
- Aluno deve pertencer à turma da avaliação
- Arredonda nota para 2 casas decimais

---

## 📝 Requisitos do Projeto (BD 2025.2)

- [x] CRUD para 3+ tabelas relacionadas
- [x] VIEW (vw_boletim_aluno)
- [x] PROCEDURE (sp_calcular_media_final)
- [x] TRIGGER (trg_validar_nota)
- [x] Dado binário (PDF da prova em BYTEA)

---

**Desenvolvido para UnB - Banco de Dados 2025.2** 🎓
