-- Schema do banco de dados para Gerador de Código ABAP

-- Tabela principal de Programas ABAP
CREATE TABLE programas_abap (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informações básicas
  nome_programa VARCHAR(40) NOT NULL, -- ABAP tem limite de 40 chars
  tipo_programa VARCHAR(50) NOT NULL, -- REPORT, CDS_VIEW, CLASS, BADI, etc.
  descricao TEXT,
  status VARCHAR(50) DEFAULT 'rascunho', -- rascunho, gerado, refinado

  -- Especificação do programa
  objetivo TEXT,
  logica_negocio TEXT,
  especificacao TEXT,

  -- Upload de EF (se aplicável)
  ef_upload TEXT, -- Texto da EF carregada
  ef_arquivo VARCHAR(255), -- Nome do arquivo original

  -- Contexto específico por tipo (JSONB para flexibilidade)
  contexto_especifico JSONB,

  -- Código gerado pela IA
  codigo_gerado JSONB, -- Estrutura completa do código gerado

  -- Sistema de perguntas/refinamento
  perguntas_ia JSONB, -- Array de perguntas feitas pela IA
  respostas_usuario JSONB, -- Array de respostas do usuário

  -- Metadata
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_user_abap FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Tabela de Tabelas ABAP utilizadas no programa
CREATE TABLE abap_tabelas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  programa_id UUID NOT NULL REFERENCES programas_abap(id) ON DELETE CASCADE,
  nome_tabela VARCHAR(30) NOT NULL, -- VBAK, MARA, ZTABLE_CUSTOM, etc.
  descricao TEXT,
  tipo VARCHAR(50), -- STANDARD, ZTABLE, YTABLE, VIEW, CDS_VIEW, etc.
  alias VARCHAR(30), -- Alias usado no código
  campos_usados TEXT[], -- Array de campos específicos usados
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_programa_tabelas FOREIGN KEY (programa_id) REFERENCES programas_abap(id)
);

-- Tabela de Campos ABAP customizados
CREATE TABLE abap_campos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  programa_id UUID NOT NULL REFERENCES programas_abap(id) ON DELETE CASCADE,
  nome_campo VARCHAR(30) NOT NULL,
  tabela VARCHAR(30), -- Tabela de origem (opcional)
  descricao TEXT,
  tipo_dado VARCHAR(20), -- CHAR, NUMC, DATS, etc.
  tamanho INTEGER,
  obrigatorio BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_programa_campos FOREIGN KEY (programa_id) REFERENCES programas_abap(id)
);

-- Tabela de Funções/Módulos para reutilização
CREATE TABLE abap_funcoes_modulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  programa_id UUID NOT NULL REFERENCES programas_abap(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50), -- FM, RFC, BAPI, METHOD, CLASS, INCLUDE, etc.
  descricao TEXT,
  parametros TEXT, -- Descrição dos parâmetros
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_programa_funcoes FOREIGN KEY (programa_id) REFERENCES programas_abap(id)
);

-- Tabela de Processos/Steps do programa
CREATE TABLE abap_processos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  programa_id UUID NOT NULL REFERENCES programas_abap(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL, -- Ordem do processo
  descricao TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_programa_processos FOREIGN KEY (programa_id) REFERENCES programas_abap(id)
);

-- Tabela de Regras de Negócio
CREATE TABLE abap_regras_negocio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  programa_id UUID NOT NULL REFERENCES programas_abap(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_programa_regras FOREIGN KEY (programa_id) REFERENCES programas_abap(id)
);

-- Índices para melhorar performance
CREATE INDEX idx_abap_user_id ON programas_abap(user_id);
CREATE INDEX idx_abap_status ON programas_abap(status);
CREATE INDEX idx_abap_tipo ON programas_abap(tipo_programa);
CREATE INDEX idx_abap_criado_em ON programas_abap(criado_em DESC);
CREATE INDEX idx_abap_tabelas_programa_id ON abap_tabelas(programa_id);
CREATE INDEX idx_abap_campos_programa_id ON abap_campos(programa_id);
CREATE INDEX idx_abap_funcoes_programa_id ON abap_funcoes_modulos(programa_id);
CREATE INDEX idx_abap_processos_programa_id ON abap_processos(programa_id);
CREATE INDEX idx_abap_regras_programa_id ON abap_regras_negocio(programa_id);

-- Índice para busca de texto (pesquisa de programas)
CREATE INDEX idx_abap_nome_programa ON programas_abap(nome_programa);
CREATE INDEX idx_abap_descricao_trgm ON programas_abap USING gin(descricao gin_trgm_ops);

-- Função para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_abap_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar atualizado_em
CREATE TRIGGER trigger_update_abap_atualizado_em
  BEFORE UPDATE ON programas_abap
  FOR EACH ROW
  EXECUTE FUNCTION update_abap_atualizado_em();

-- RLS (Row Level Security) para segurança
ALTER TABLE programas_abap ENABLE ROW LEVEL SECURITY;
ALTER TABLE abap_tabelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE abap_campos ENABLE ROW LEVEL SECURITY;
ALTER TABLE abap_funcoes_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE abap_processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE abap_regras_negocio ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança - usuários só podem ver seus próprios programas
CREATE POLICY "Usuários podem ver seus próprios programas ABAP"
  ON programas_abap
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios programas ABAP"
  ON programas_abap
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios programas ABAP"
  ON programas_abap
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios programas ABAP"
  ON programas_abap
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para tabelas relacionadas
CREATE POLICY "Usuários podem ver tabelas de seus programas"
  ON abap_tabelas
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM programas_abap
    WHERE id = abap_tabelas.programa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem gerenciar tabelas de seus programas"
  ON abap_tabelas
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM programas_abap
    WHERE id = abap_tabelas.programa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem ver campos de seus programas"
  ON abap_campos
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM programas_abap
    WHERE id = abap_campos.programa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem gerenciar campos de seus programas"
  ON abap_campos
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM programas_abap
    WHERE id = abap_campos.programa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem ver funções de seus programas"
  ON abap_funcoes_modulos
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM programas_abap
    WHERE id = abap_funcoes_modulos.programa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem gerenciar funções de seus programas"
  ON abap_funcoes_modulos
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM programas_abap
    WHERE id = abap_funcoes_modulos.programa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem ver processos de seus programas"
  ON abap_processos
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM programas_abap
    WHERE id = abap_processos.programa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem gerenciar processos de seus programas"
  ON abap_processos
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM programas_abap
    WHERE id = abap_processos.programa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem ver regras de seus programas"
  ON abap_regras_negocio
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM programas_abap
    WHERE id = abap_regras_negocio.programa_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem gerenciar regras de seus programas"
  ON abap_regras_negocio
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM programas_abap
    WHERE id = abap_regras_negocio.programa_id AND user_id = auth.uid()
  ));

-- View para estatísticas do usuário
CREATE OR REPLACE VIEW abap_user_stats AS
SELECT
  user_id,
  COUNT(*) as total_programas,
  COUNT(CASE WHEN status = 'gerado' THEN 1 END) as programas_gerados,
  COUNT(CASE WHEN status = 'refinado' THEN 1 END) as programas_refinados,
  COUNT(CASE WHEN status = 'rascunho' THEN 1 END) as programas_rascunho,
  COUNT(CASE WHEN criado_em >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as programas_recentes,
  MAX(criado_em) as ultima_geracao
FROM programas_abap
GROUP BY user_id;

-- View para estatísticas por tipo de programa
CREATE OR REPLACE VIEW abap_tipos_stats AS
SELECT
  user_id,
  tipo_programa,
  COUNT(*) as total
FROM programas_abap
WHERE status IN ('gerado', 'refinado')
GROUP BY user_id, tipo_programa
ORDER BY total DESC;

-- View para listar programas com informações resumidas
CREATE OR REPLACE VIEW abap_programas_resumo AS
SELECT
  p.id,
  p.user_id,
  p.nome_programa,
  p.tipo_programa,
  p.descricao,
  p.status,
  p.criado_em,
  p.atualizado_em,
  COUNT(DISTINCT t.id) as total_tabelas,
  COUNT(DISTINCT c.id) as total_campos,
  COUNT(DISTINCT f.id) as total_funcoes,
  (p.codigo_gerado IS NOT NULL) as tem_codigo
FROM programas_abap p
LEFT JOIN abap_tabelas t ON t.programa_id = p.id
LEFT JOIN abap_campos c ON c.programa_id = p.id
LEFT JOIN abap_funcoes_modulos f ON f.programa_id = p.id
GROUP BY p.id;

-- Comentários nas tabelas e colunas
COMMENT ON TABLE programas_abap IS 'Tabela principal de programas ABAP gerados pela IA';
COMMENT ON TABLE abap_tabelas IS 'Tabelas SAP utilizadas nos programas ABAP';
COMMENT ON TABLE abap_campos IS 'Campos customizados definidos nos programas ABAP';
COMMENT ON TABLE abap_funcoes_modulos IS 'Funções e módulos reutilizados nos programas ABAP';
COMMENT ON TABLE abap_processos IS 'Processos/steps do programa ABAP';
COMMENT ON TABLE abap_regras_negocio IS 'Regras de negócio do programa ABAP';

COMMENT ON COLUMN programas_abap.codigo_gerado IS 'JSON contendo código principal, códigos adicionais, documentação, etc.';
COMMENT ON COLUMN programas_abap.perguntas_ia IS 'Array de perguntas feitas pela IA para complementar contexto';
COMMENT ON COLUMN programas_abap.respostas_usuario IS 'Array de respostas do usuário às perguntas da IA';
COMMENT ON COLUMN programas_abap.contexto_especifico IS 'Contexto específico do tipo de programa (ContextoReport, ContextoALV, etc.)';
