-- Tabela principal de Especificações Funcionais
CREATE TABLE especificacoes_funcionais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  versao VARCHAR(50) DEFAULT '1.0',
  descricao TEXT,
  status VARCHAR(50) DEFAULT 'rascunho', -- rascunho, refinado, publicado

  -- Dados SAP
  modulo_sap VARCHAR(10) NOT NULL, -- SD, MM, FI, CO, PP, HR, etc
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  empresa VARCHAR(255),
  tipo_programa VARCHAR(100), -- Report, Function Module, Class, Enhancement, etc

  -- Conteúdo
  visao_geral TEXT,
  motivo_ef TEXT,
  especificacao_detalhada TEXT,

  -- Conteúdo refinado pela IA
  conteudo_refinado JSONB, -- Armazena todo o JSON retornado pela IA

  -- Metadata
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Índices para busca
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Tabela de membros da equipe do projeto
CREATE TABLE ef_equipe (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ef_id UUID NOT NULL REFERENCES especificacoes_funcionais(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_ef FOREIGN KEY (ef_id) REFERENCES especificacoes_funcionais(id)
);

-- Tabela de tabelas SAP utilizadas na EF
CREATE TABLE ef_tabelas_sap (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ef_id UUID NOT NULL REFERENCES especificacoes_funcionais(id) ON DELETE CASCADE,
  nome_tabela VARCHAR(100) NOT NULL, -- Ex: VBAK, VBAP, MARA, etc
  descricao TEXT,
  tipo VARCHAR(50), -- Padrão SAP, Z-Table, Y-Table, etc
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_ef_tabelas FOREIGN KEY (ef_id) REFERENCES especificacoes_funcionais(id)
);

-- Tabela de módulos/componentes relacionados
CREATE TABLE ef_modulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ef_id UUID NOT NULL REFERENCES especificacoes_funcionais(id) ON DELETE CASCADE,
  nome_modulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50), -- Function Module, Class, Program, Transaction, etc
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_ef_modulos FOREIGN KEY (ef_id) REFERENCES especificacoes_funcionais(id)
);

-- Índices para melhorar performance
CREATE INDEX idx_ef_user_id ON especificacoes_funcionais(user_id);
CREATE INDEX idx_ef_status ON especificacoes_funcionais(status);
CREATE INDEX idx_ef_modulo_sap ON especificacoes_funcionais(modulo_sap);
CREATE INDEX idx_ef_criado_em ON especificacoes_funcionais(criado_em DESC);
CREATE INDEX idx_ef_equipe_ef_id ON ef_equipe(ef_id);
CREATE INDEX idx_ef_tabelas_ef_id ON ef_tabelas_sap(ef_id);
CREATE INDEX idx_ef_modulos_ef_id ON ef_modulos(ef_id);

-- Função para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar atualizado_em
CREATE TRIGGER trigger_update_ef_atualizado_em
  BEFORE UPDATE ON especificacoes_funcionais
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

-- RLS (Row Level Security) para segurança
ALTER TABLE especificacoes_funcionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE ef_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE ef_tabelas_sap ENABLE ROW LEVEL SECURITY;
ALTER TABLE ef_modulos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança - usuários só podem ver suas próprias EFs
CREATE POLICY "Usuários podem ver suas próprias EFs"
  ON especificacoes_funcionais
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias EFs"
  ON especificacoes_funcionais
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias EFs"
  ON especificacoes_funcionais
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias EFs"
  ON especificacoes_funcionais
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para tabelas relacionadas
CREATE POLICY "Usuários podem ver equipe de suas EFs"
  ON ef_equipe
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM especificacoes_funcionais
    WHERE id = ef_equipe.ef_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem gerenciar equipe de suas EFs"
  ON ef_equipe
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM especificacoes_funcionais
    WHERE id = ef_equipe.ef_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem ver tabelas de suas EFs"
  ON ef_tabelas_sap
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM especificacoes_funcionais
    WHERE id = ef_tabelas_sap.ef_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem gerenciar tabelas de suas EFs"
  ON ef_tabelas_sap
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM especificacoes_funcionais
    WHERE id = ef_tabelas_sap.ef_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem ver módulos de suas EFs"
  ON ef_modulos
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM especificacoes_funcionais
    WHERE id = ef_modulos.ef_id AND user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem gerenciar módulos de suas EFs"
  ON ef_modulos
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM especificacoes_funcionais
    WHERE id = ef_modulos.ef_id AND user_id = auth.uid()
  ));

-- View para estatísticas do usuário
CREATE OR REPLACE VIEW ef_user_stats AS
SELECT
  user_id,
  COUNT(*) as total_efs,
  COUNT(CASE WHEN status = 'publicado' THEN 1 END) as efs_publicadas,
  COUNT(CASE WHEN status = 'refinado' THEN 1 END) as efs_refinadas,
  COUNT(CASE WHEN status = 'rascunho' THEN 1 END) as efs_rascunho,
  COUNT(CASE WHEN criado_em >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as efs_recentes,
  MAX(criado_em) as ultima_ef_criada
FROM especificacoes_funcionais
GROUP BY user_id;
