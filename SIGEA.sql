CREATE TABLE escola (
    id_escola             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome                  VARCHAR(100) NOT NULL,
    cnpj                  CHAR(14),
    telefone              VARCHAR(20),
    email                 VARCHAR(100),
    regiao_administrativa VARCHAR(100)
);

CREATE TABLE coordenador (
    id_coordenador        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_escola             INTEGER NOT NULL,
    nome                  VARCHAR(100) NOT NULL,
    email                 VARCHAR(100),
    telefone              VARCHAR(20),
    CONSTRAINT fk_coordenador_escola
        FOREIGN KEY (id_escola) REFERENCES escola (id_escola)
);

CREATE TABLE professor (
    id_professor          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_escola             INTEGER NOT NULL,
    nome                  VARCHAR(100) NOT NULL,
    email                 VARCHAR(100),
    telefone              VARCHAR(20),
    CONSTRAINT fk_professor_escola
        FOREIGN KEY (id_escola) REFERENCES escola (id_escola)
);

CREATE TABLE turma (
    id_turma              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_escola             INTEGER NOT NULL,
    nome                  VARCHAR(50) NOT NULL,
    ano_letivo            INTEGER NOT NULL,
    serie                 VARCHAR(20),
    turno                 VARCHAR(20),
    CONSTRAINT fk_turma_escola
        FOREIGN KEY (id_escola) REFERENCES escola (id_escola)
);

CREATE TABLE aluno (
    id_aluno              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_turma              INTEGER NOT NULL,
    nome                  VARCHAR(100) NOT NULL,
    matricula             VARCHAR(30) NOT NULL,
    data_nascimento       DATE,
    email                 VARCHAR(100),
    telefone_responsavel  VARCHAR(20),
    CONSTRAINT fk_aluno_turma
        FOREIGN KEY (id_turma) REFERENCES turma (id_turma),
    CONSTRAINT uq_aluno_matricula UNIQUE (matricula)
);

CREATE TABLE disciplina (
    id_disciplina         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome                  VARCHAR(100) NOT NULL,
    carga_horaria         INTEGER,
    area_conhecimento     VARCHAR(100)
);

CREATE TABLE periodo_letivo (
    id_periodo_letivo     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ano                   INTEGER NOT NULL,
    etapa                 VARCHAR(30) NOT NULL,
    data_inicio           DATE,
    data_fim              DATE
);

CREATE TABLE turma_professor (
    id_turma_professor    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_turma              INTEGER NOT NULL,
    id_professor          INTEGER NOT NULL,
    id_disciplina         INTEGER NOT NULL,
    CONSTRAINT fk_tp_turma
        FOREIGN KEY (id_turma) REFERENCES turma (id_turma),
    CONSTRAINT fk_tp_professor
        FOREIGN KEY (id_professor) REFERENCES professor (id_professor),
    CONSTRAINT fk_tp_disciplina
        FOREIGN KEY (id_disciplina) REFERENCES disciplina (id_disciplina)
);

CREATE TABLE avaliacao (
    id_avaliacao          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_turma_professor    INTEGER NOT NULL,
    id_periodo_letivo     INTEGER NOT NULL,
    titulo                VARCHAR(100) NOT NULL,
    tipo                  VARCHAR(30),
    data_aplicacao        DATE NOT NULL,
    peso                  NUMERIC(5,2) DEFAULT 1.00,
    CONSTRAINT fk_avaliacao_tp
        FOREIGN KEY (id_turma_professor) REFERENCES turma_professor (id_turma_professor),
    CONSTRAINT fk_avaliacao_periodo
        FOREIGN KEY (id_periodo_letivo) REFERENCES periodo_letivo (id_periodo_letivo)
);

CREATE TABLE nota (
    id_nota               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_avaliacao          INTEGER NOT NULL,
    id_aluno              INTEGER NOT NULL,
    nota_obtida           NUMERIC(5,2) NOT NULL,
    data_lancamento       DATE DEFAULT CURRENT_DATE,
    CONSTRAINT fk_nota_avaliacao
        FOREIGN KEY (id_avaliacao) REFERENCES avaliacao (id_avaliacao),
    CONSTRAINT fk_nota_aluno
        FOREIGN KEY (id_aluno) REFERENCES aluno (id_aluno)
);

CREATE TABLE regra_aprovacao (
    id_regra              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_escola             INTEGER NOT NULL,
    id_coordenador        INTEGER NOT NULL,
    ano_letivo            INTEGER NOT NULL,
    media_minima          NUMERIC(5,2) NOT NULL,
    CONSTRAINT fk_regra_escola
        FOREIGN KEY (id_escola) REFERENCES escola (id_escola),
    CONSTRAINT fk_regra_coordenador
        FOREIGN KEY (id_coordenador) REFERENCES coordenador (id_coordenador),
    CONSTRAINT uq_regra_escola_ano UNIQUE (id_escola, ano_letivo)
);