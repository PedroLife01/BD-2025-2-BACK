-- ============================================
-- SIGEA Backend - Objetos SQL Avançados
-- ============================================
-- VIEW: Boletim do Aluno
-- PROCEDURE: Calcular Média Final
-- TRIGGER: Validar Nota
-- ============================================

-- ==============================================
-- VIEW: vw_boletim_aluno
-- ==============================================
-- Retorna o boletim completo de um aluno com todas
-- as notas organizadas por disciplina e período
-- ==============================================

DROP VIEW IF EXISTS vw_boletim_aluno;

CREATE OR REPLACE VIEW vw_boletim_aluno AS
SELECT 
    a.id_aluno,
    a.nome AS nome_aluno,
    a.matricula,
    t.id_turma,
    t.nome AS nome_turma,
    t.ano_letivo,
    e.id_escola,
    e.nome AS nome_escola,
    d.id_disciplina,
    d.nome AS nome_disciplina,
    p.nome AS nome_professor,
    pl.id_periodo_letivo,
    pl.etapa AS nome_periodo,
    av.id_avaliacao,
    av.titulo AS titulo_avaliacao,
    av.peso AS peso_avaliacao,
    n.nota_obtida,
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
    -- Média geral da disciplina
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
    a.nome, d.nome, pl.etapa, av.data_aplicacao;


-- ==============================================
-- PROCEDURE: sp_calcular_media_final
-- ==============================================
-- Calcula a média final ponderada de um aluno em
-- uma disciplina específica, considerando todas
-- as avaliações e seus pesos
-- ==============================================

CREATE OR REPLACE FUNCTION sp_calcular_media_final(
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
    -- Busca a média mínima da escola do aluno
    SELECT COALESCE(ra.media_minima, 6.0) INTO v_media_minima
    FROM aluno a
    INNER JOIN turma t ON t.id_turma = a.id_turma
    LEFT JOIN regra_aprovacao ra ON ra.id_escola = t.id_escola
    WHERE a.id_aluno = p_id_aluno
    ORDER BY ra.id_regra DESC
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
-- com estatísticas de cada aluno
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
    menor_nota NUMERIC
) AS $$
BEGIN
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
        END,
        MAX(n.nota_obtida),
        MIN(n.nota_obtida)
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
-- TRIGGER: trg_validar_nota
-- ==============================================
-- Valida se a nota está dentro do intervalo 0-10
-- antes de inserir ou atualizar
-- ==============================================

CREATE OR REPLACE FUNCTION fn_validar_nota()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se a nota está no intervalo válido
    IF NEW.nota_obtida < 0 OR NEW.nota_obtida > 10 THEN
        RAISE EXCEPTION 'Nota deve estar entre 0 e 10. Valor informado: %', NEW.nota_obtida;
    END IF;
    
    -- Verifica se o aluno pertence à turma da avaliação
    PERFORM 1
    FROM avaliacao av
    INNER JOIN turma_professor tp ON tp.id_turma_professor = av.id_turma_professor
    INNER JOIN aluno a ON a.id_turma = tp.id_turma
    WHERE av.id_avaliacao = NEW.id_avaliacao
    AND a.id_aluno = NEW.id_aluno;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'O aluno % não pertence à turma desta avaliação', NEW.id_aluno;
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
-- COMENTÁRIOS NOS OBJETOS
-- ==============================================
COMMENT ON VIEW vw_boletim_aluno IS 'View que apresenta o boletim completo do aluno com notas, médias por período e disciplina';
COMMENT ON FUNCTION sp_calcular_media_final IS 'Calcula a média final ponderada de um aluno em uma disciplina';
COMMENT ON FUNCTION fn_gerar_relatorio_turma IS 'Gera relatório de desempenho de todos os alunos de uma turma';
