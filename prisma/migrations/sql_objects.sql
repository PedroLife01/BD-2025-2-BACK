-- ============================================
-- SIGEA Backend - Objetos SQL Avançados
-- ============================================
-- Alinhado com SIGEA.sql
-- VIEW: Boletim do Aluno
-- VIEW: Estatísticas por Turma
-- VIEW: Estatísticas por Escola
-- FUNCTION: Calcular Média Final
-- FUNCTION: Relatório de Turma
-- TRIGGER: Validar Nota
-- TRIGGER: Atualizar Data Lançamento
-- ============================================

-- ==============================================
-- VIEW: vw_boletim_aluno
-- ==============================================
-- Retorna o boletim completo de um aluno com todas
-- as notas organizadas por disciplina e período
-- ==============================================

DROP VIEW IF EXISTS vw_boletim_aluno CASCADE;

CREATE OR REPLACE VIEW vw_boletim_aluno AS
SELECT 
    a.id_aluno,
    a.nome AS nome_aluno,
    a.matricula,
    t.id_turma,
    t.nome AS nome_turma,
    t.serie,
    t.ano_letivo,
    e.id_escola,
    e.nome AS nome_escola,
    d.id_disciplina,
    d.nome AS nome_disciplina,
    p.id_professor,
    p.nome AS nome_professor,
    pl.id_periodo_letivo,
    pl.ano AS ano_periodo,
    pl.etapa AS etapa_periodo,
    av.id_avaliacao,
    av.titulo AS titulo_avaliacao,
    av.tipo AS tipo_avaliacao,
    av.peso AS peso_avaliacao,
    av.data_aplicacao,
    n.id_nota,
    n.nota_obtida,
    n.data_lancamento,
    -- Média ponderada por disciplina/período
    ROUND(
        SUM(n.nota_obtida * av.peso) OVER (
            PARTITION BY a.id_aluno, d.id_disciplina, pl.id_periodo_letivo
        ) / NULLIF(
            SUM(av.peso) OVER (
                PARTITION BY a.id_aluno, d.id_disciplina, pl.id_periodo_letivo
            ), 0
        ), 2
    ) AS media_periodo,
    -- Média geral da disciplina (todos períodos)
    ROUND(
        SUM(n.nota_obtida * av.peso) OVER (
            PARTITION BY a.id_aluno, d.id_disciplina
        ) / NULLIF(
            SUM(av.peso) OVER (
                PARTITION BY a.id_aluno, d.id_disciplina
            ), 0
        ), 2
    ) AS media_disciplina
FROM 
    aluno a
    INNER JOIN turma t ON t.id_turma = a.id_turma
    INNER JOIN escola e ON e.id_escola = t.id_escola
    INNER JOIN turma_professor tp ON tp.id_turma = t.id_turma
    INNER JOIN professor p ON p.id_professor = tp.id_professor
    INNER JOIN disciplina d ON d.id_disciplina = tp.id_disciplina
    LEFT JOIN avaliacao av ON av.id_turma_professor = tp.id_turma_professor
    LEFT JOIN periodo_letivo pl ON pl.id_periodo_letivo = av.id_periodo_letivo
    LEFT JOIN nota n ON n.id_avaliacao = av.id_avaliacao AND n.id_aluno = a.id_aluno
ORDER BY 
    a.nome, d.nome, pl.ano, pl.etapa, av.data_aplicacao;


-- ==============================================
-- VIEW: vw_estatisticas_turma
-- ==============================================
-- Estatísticas de desempenho por turma
-- ==============================================

DROP VIEW IF EXISTS vw_estatisticas_turma CASCADE;

CREATE OR REPLACE VIEW vw_estatisticas_turma AS
SELECT 
    t.id_turma,
    t.nome AS nome_turma,
    t.ano_letivo,
    t.serie,
    e.id_escola,
    e.nome AS nome_escola,
    d.id_disciplina,
    d.nome AS nome_disciplina,
    COUNT(DISTINCT a.id_aluno) AS total_alunos,
    COUNT(DISTINCT av.id_avaliacao) AS total_avaliacoes,
    COUNT(n.id_nota) AS total_notas,
    ROUND(AVG(n.nota_obtida), 2) AS media_geral,
    MAX(n.nota_obtida) AS maior_nota,
    MIN(n.nota_obtida) AS menor_nota,
    ROUND(STDDEV(n.nota_obtida), 2) AS desvio_padrao,
    COUNT(CASE WHEN n.nota_obtida >= 6 THEN 1 END) AS aprovados,
    COUNT(CASE WHEN n.nota_obtida < 6 THEN 1 END) AS reprovados
FROM 
    turma t
    INNER JOIN escola e ON e.id_escola = t.id_escola
    INNER JOIN turma_professor tp ON tp.id_turma = t.id_turma
    INNER JOIN disciplina d ON d.id_disciplina = tp.id_disciplina
    LEFT JOIN aluno a ON a.id_turma = t.id_turma
    LEFT JOIN avaliacao av ON av.id_turma_professor = tp.id_turma_professor
    LEFT JOIN nota n ON n.id_avaliacao = av.id_avaliacao AND n.id_aluno = a.id_aluno
GROUP BY 
    t.id_turma, t.nome, t.ano_letivo, t.serie,
    e.id_escola, e.nome,
    d.id_disciplina, d.nome;


-- ==============================================
-- VIEW: vw_estatisticas_escola
-- ==============================================
-- Estatísticas gerais por escola
-- ==============================================

DROP VIEW IF EXISTS vw_estatisticas_escola CASCADE;

CREATE OR REPLACE VIEW vw_estatisticas_escola AS
SELECT 
    e.id_escola,
    e.nome AS nome_escola,
    e.regiao_administrativa,
    COUNT(DISTINCT t.id_turma) AS total_turmas,
    COUNT(DISTINCT a.id_aluno) AS total_alunos,
    COUNT(DISTINCT p.id_professor) AS total_professores,
    COUNT(DISTINCT c.id_coordenador) AS total_coordenadores,
    COUNT(DISTINCT av.id_avaliacao) AS total_avaliacoes,
    ROUND(AVG(n.nota_obtida), 2) AS media_geral,
    ra.media_minima AS media_minima_aprovacao
FROM 
    escola e
    LEFT JOIN turma t ON t.id_escola = e.id_escola
    LEFT JOIN aluno a ON a.id_turma = t.id_turma
    LEFT JOIN professor p ON p.id_escola = e.id_escola
    LEFT JOIN coordenador c ON c.id_escola = e.id_escola
    LEFT JOIN turma_professor tp ON tp.id_turma = t.id_turma
    LEFT JOIN avaliacao av ON av.id_turma_professor = tp.id_turma_professor
    LEFT JOIN nota n ON n.id_avaliacao = av.id_avaliacao
    LEFT JOIN regra_aprovacao ra ON ra.id_escola = e.id_escola AND ra.ano_letivo = t.ano_letivo
GROUP BY 
    e.id_escola, e.nome, e.regiao_administrativa, ra.media_minima;


-- ==============================================
-- FUNCTION: fn_calcular_media_final
-- ==============================================
-- Calcula a média final ponderada de um aluno em
-- uma disciplina específica
-- ==============================================

CREATE OR REPLACE FUNCTION fn_calcular_media_final(
    p_id_aluno INTEGER,
    p_id_disciplina INTEGER
)
RETURNS TABLE (
    nome_aluno VARCHAR,
    matricula VARCHAR,
    nome_disciplina VARCHAR,
    total_avaliacoes BIGINT,
    soma_pesos NUMERIC,
    media_final NUMERIC,
    situacao VARCHAR
) AS $$
DECLARE
    v_media_minima NUMERIC;
BEGIN
    -- Busca a média mínima da escola do aluno para o ano atual
    SELECT COALESCE(ra.media_minima, 6.0) INTO v_media_minima
    FROM aluno a
    INNER JOIN turma t ON t.id_turma = a.id_turma
    LEFT JOIN regra_aprovacao ra ON ra.id_escola = t.id_escola AND ra.ano_letivo = t.ano_letivo
    WHERE a.id_aluno = p_id_aluno
    LIMIT 1;

    -- Retorna dados do aluno com média calculada
    RETURN QUERY
    SELECT 
        al.nome::VARCHAR AS nome_aluno,
        al.matricula::VARCHAR AS matricula,
        di.nome::VARCHAR AS nome_disciplina,
        COUNT(n.id_nota) AS total_avaliacoes,
        COALESCE(SUM(av.peso), 0)::NUMERIC AS soma_pesos,
        CASE 
            WHEN SUM(av.peso) > 0 THEN 
                ROUND(SUM(n.nota_obtida * av.peso) / SUM(av.peso), 2)
            ELSE 0
        END AS media_final,
        CASE 
            WHEN SUM(av.peso) > 0 AND 
                 ROUND(SUM(n.nota_obtida * av.peso) / SUM(av.peso), 2) >= v_media_minima 
            THEN 'APROVADO'::VARCHAR
            ELSE 'REPROVADO'::VARCHAR
        END AS situacao
    FROM aluno al
    INNER JOIN turma t ON t.id_turma = al.id_turma
    INNER JOIN turma_professor tp ON tp.id_turma = t.id_turma
    INNER JOIN disciplina di ON di.id_disciplina = tp.id_disciplina
    LEFT JOIN avaliacao av ON av.id_turma_professor = tp.id_turma_professor
    LEFT JOIN nota n ON n.id_avaliacao = av.id_avaliacao AND n.id_aluno = al.id_aluno
    WHERE al.id_aluno = p_id_aluno AND di.id_disciplina = p_id_disciplina
    GROUP BY al.id_aluno, al.nome, al.matricula, di.id_disciplina, di.nome;
END;
$$ LANGUAGE plpgsql;


-- ==============================================
-- FUNCTION: fn_gerar_relatorio_turma
-- ==============================================
-- Gera relatório de desempenho de uma turma
-- ==============================================

CREATE OR REPLACE FUNCTION fn_gerar_relatorio_turma(
    p_id_turma INTEGER
)
RETURNS TABLE (
    nome_aluno VARCHAR,
    matricula VARCHAR,
    nome_disciplina VARCHAR,
    total_avaliacoes BIGINT,
    media_final NUMERIC,
    maior_nota NUMERIC,
    menor_nota NUMERIC,
    situacao VARCHAR
) AS $$
DECLARE
    v_media_minima NUMERIC;
BEGIN
    -- Busca a média mínima da escola da turma
    SELECT COALESCE(ra.media_minima, 6.0) INTO v_media_minima
    FROM turma t
    LEFT JOIN regra_aprovacao ra ON ra.id_escola = t.id_escola AND ra.ano_letivo = t.ano_letivo
    WHERE t.id_turma = p_id_turma
    LIMIT 1;

    RETURN QUERY
    SELECT 
        al.nome::VARCHAR,
        al.matricula::VARCHAR,
        di.nome::VARCHAR,
        COUNT(n.id_nota),
        CASE 
            WHEN SUM(av.peso) > 0 THEN 
                ROUND(SUM(n.nota_obtida * av.peso) / SUM(av.peso), 2)
            ELSE 0
        END AS media_final,
        MAX(n.nota_obtida),
        MIN(n.nota_obtida),
        CASE 
            WHEN SUM(av.peso) > 0 AND 
                 ROUND(SUM(n.nota_obtida * av.peso) / SUM(av.peso), 2) >= v_media_minima 
            THEN 'APROVADO'::VARCHAR
            ELSE 'REPROVADO'::VARCHAR
        END
    FROM aluno al
    INNER JOIN turma t ON t.id_turma = al.id_turma
    INNER JOIN turma_professor tp ON tp.id_turma = t.id_turma
    INNER JOIN disciplina di ON di.id_disciplina = tp.id_disciplina
    LEFT JOIN avaliacao av ON av.id_turma_professor = tp.id_turma_professor
    LEFT JOIN nota n ON n.id_avaliacao = av.id_avaliacao AND n.id_aluno = al.id_aluno
    WHERE t.id_turma = p_id_turma
    GROUP BY al.id_aluno, al.nome, al.matricula, di.id_disciplina, di.nome
    ORDER BY al.nome, di.nome;
END;
$$ LANGUAGE plpgsql;


-- ==============================================
-- FUNCTION: fn_estatisticas_escola
-- ==============================================
-- Retorna estatísticas detalhadas de uma escola
-- ==============================================

CREATE OR REPLACE FUNCTION fn_estatisticas_escola(
    p_id_escola INTEGER
)
RETURNS TABLE (
    nome_escola VARCHAR,
    total_turmas BIGINT,
    total_alunos BIGINT,
    total_professores BIGINT,
    media_geral NUMERIC,
    taxa_aprovacao NUMERIC
) AS $$
DECLARE
    v_media_minima NUMERIC;
BEGIN
    -- Busca média mínima da escola
    SELECT COALESCE(ra.media_minima, 6.0) INTO v_media_minima
    FROM regra_aprovacao ra
    WHERE ra.id_escola = p_id_escola
    ORDER BY ra.ano_letivo DESC
    LIMIT 1;

    RETURN QUERY
    WITH notas_alunos AS (
        SELECT 
            a.id_aluno,
            CASE 
                WHEN SUM(av.peso) > 0 THEN 
                    ROUND(SUM(n.nota_obtida * av.peso) / SUM(av.peso), 2)
                ELSE 0
            END AS media_aluno
        FROM aluno a
        INNER JOIN turma t ON t.id_turma = a.id_turma
        LEFT JOIN turma_professor tp ON tp.id_turma = t.id_turma
        LEFT JOIN avaliacao av ON av.id_turma_professor = tp.id_turma_professor
        LEFT JOIN nota n ON n.id_avaliacao = av.id_avaliacao AND n.id_aluno = a.id_aluno
        WHERE t.id_escola = p_id_escola
        GROUP BY a.id_aluno
    )
    SELECT 
        e.nome::VARCHAR,
        COUNT(DISTINCT t.id_turma),
        COUNT(DISTINCT a.id_aluno),
        COUNT(DISTINCT p.id_professor),
        ROUND(AVG(na.media_aluno), 2),
        ROUND(
            COUNT(CASE WHEN na.media_aluno >= v_media_minima THEN 1 END)::NUMERIC / 
            NULLIF(COUNT(na.id_aluno), 0) * 100, 2
        )
    FROM escola e
    LEFT JOIN turma t ON t.id_escola = e.id_escola
    LEFT JOIN aluno a ON a.id_turma = t.id_turma
    LEFT JOIN professor p ON p.id_escola = e.id_escola
    LEFT JOIN notas_alunos na ON na.id_aluno = a.id_aluno
    WHERE e.id_escola = p_id_escola
    GROUP BY e.id_escola, e.nome;
END;
$$ LANGUAGE plpgsql;


-- ==============================================
-- TRIGGER FUNCTION: fn_validar_nota
-- ==============================================
-- Valida se a nota está dentro do intervalo 0-10
-- ==============================================

CREATE OR REPLACE FUNCTION fn_validar_nota()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se a nota está no intervalo válido
    IF NEW.nota_obtida < 0 OR NEW.nota_obtida > 10 THEN
        RAISE EXCEPTION 'Nota deve estar entre 0 e 10. Valor informado: %', NEW.nota_obtida;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_nota ON nota;

CREATE TRIGGER trg_validar_nota
    BEFORE INSERT OR UPDATE ON nota
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_nota();


-- ==============================================
-- TRIGGER FUNCTION: fn_atualizar_data_lancamento
-- ==============================================
-- Atualiza a data de lançamento ao modificar nota
-- ==============================================

CREATE OR REPLACE FUNCTION fn_atualizar_data_lancamento()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_lancamento = CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualizar_data_lancamento ON nota;

CREATE TRIGGER trg_atualizar_data_lancamento
    BEFORE UPDATE ON nota
    FOR EACH ROW
    WHEN (OLD.nota_obtida IS DISTINCT FROM NEW.nota_obtida)
    EXECUTE FUNCTION fn_atualizar_data_lancamento();


-- ==============================================
-- TRIGGER FUNCTION: fn_validar_regra_aprovacao
-- ==============================================
-- Valida se a média mínima está entre 0 e 10
-- ==============================================

CREATE OR REPLACE FUNCTION fn_validar_regra_aprovacao()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.media_minima < 0 OR NEW.media_minima > 10 THEN
        RAISE EXCEPTION 'Média mínima deve estar entre 0 e 10. Valor informado: %', NEW.media_minima;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_regra_aprovacao ON regra_aprovacao;

CREATE TRIGGER trg_validar_regra_aprovacao
    BEFORE INSERT OR UPDATE ON regra_aprovacao
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_regra_aprovacao();


-- ==============================================
-- COMENTÁRIOS NOS OBJETOS
-- ==============================================
COMMENT ON VIEW vw_boletim_aluno IS 'View que apresenta o boletim completo do aluno com notas, médias por período e disciplina';
COMMENT ON VIEW vw_estatisticas_turma IS 'View com estatísticas de desempenho por turma e disciplina';
COMMENT ON VIEW vw_estatisticas_escola IS 'View com estatísticas gerais por escola';
COMMENT ON FUNCTION fn_calcular_media_final IS 'Calcula a média final ponderada de um aluno em uma disciplina';
COMMENT ON FUNCTION fn_gerar_relatorio_turma IS 'Gera relatório de desempenho de todos os alunos de uma turma';
COMMENT ON FUNCTION fn_estatisticas_escola IS 'Retorna estatísticas detalhadas de uma escola específica';
COMMENT ON FUNCTION fn_validar_nota IS 'Trigger function que valida notas (0-10)';
COMMENT ON FUNCTION fn_atualizar_data_lancamento IS 'Trigger function que atualiza data de lançamento ao modificar nota';
COMMENT ON FUNCTION fn_validar_regra_aprovacao IS 'Trigger function que valida média mínima de aprovação (0-10)';
