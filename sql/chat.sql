-- Tabela de projetos de chat
CREATE TABLE chat_projetos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  contexto TEXT, -- Contexto específico do projeto enviado com cada mensagem
  cor VARCHAR(7) DEFAULT '#2b6cfd', -- Cor para identificação visual
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_user_projeto FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Tabela de mensagens do chat
CREATE TABLE chat_mensagens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  projeto_id UUID REFERENCES chat_projetos(id) ON DELETE CASCADE, -- NULL se for chat sem projeto
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  conteudo TEXT NOT NULL,
  conteudo_limpo TEXT, -- Conteúdo sem blocos <thinking>
  tokens_usados INTEGER DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_user_mensagem FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_projeto_mensagem FOREIGN KEY (projeto_id) REFERENCES chat_projetos(id)
);

-- Índices para performance
CREATE INDEX idx_chat_projetos_user_id ON chat_projetos(user_id);
CREATE INDEX idx_chat_projetos_atualizado_em ON chat_projetos(atualizado_em DESC);
CREATE INDEX idx_chat_mensagens_user_id ON chat_mensagens(user_id);
CREATE INDEX idx_chat_mensagens_projeto_id ON chat_mensagens(projeto_id);
CREATE INDEX idx_chat_mensagens_criado_em ON chat_mensagens(criado_em ASC);

-- Função para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_projeto_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar atualizado_em ao modificar projeto
CREATE TRIGGER trigger_update_projeto_atualizado_em
  BEFORE UPDATE ON chat_projetos
  FOR EACH ROW
  EXECUTE FUNCTION update_projeto_atualizado_em();

-- Trigger para atualizar projeto quando adiciona mensagem
CREATE OR REPLACE FUNCTION update_projeto_on_mensagem()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.projeto_id IS NOT NULL THEN
    UPDATE chat_projetos
    SET atualizado_em = CURRENT_TIMESTAMP
    WHERE id = NEW.projeto_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_projeto_on_mensagem
  AFTER INSERT ON chat_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION update_projeto_on_mensagem();

-- RLS (Row Level Security)
ALTER TABLE chat_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas para projetos
CREATE POLICY "Usuários podem ver seus próprios projetos"
  ON chat_projetos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios projetos"
  ON chat_projetos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios projetos"
  ON chat_projetos
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios projetos"
  ON chat_projetos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para mensagens
CREATE POLICY "Usuários podem ver suas próprias mensagens"
  ON chat_mensagens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias mensagens"
  ON chat_mensagens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias mensagens"
  ON chat_mensagens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias mensagens"
  ON chat_mensagens
  FOR DELETE
  USING (auth.uid() = user_id);

-- View para estatísticas de chat
CREATE OR REPLACE VIEW chat_stats AS
SELECT
  user_id,
  COUNT(DISTINCT projeto_id) as total_projetos,
  COUNT(*) FILTER (WHERE role = 'user') as total_mensagens_usuario,
  COUNT(*) FILTER (WHERE role = 'assistant') as total_mensagens_ia,
  SUM(tokens_usados) as total_tokens_usados,
  MAX(criado_em) as ultima_mensagem
FROM chat_mensagens
GROUP BY user_id;

-- View para últimos projetos com contagem de mensagens
CREATE OR REPLACE VIEW chat_projetos_resumo AS
SELECT
  p.id,
  p.user_id,
  p.nome,
  p.descricao,
  p.contexto,
  p.cor,
  p.criado_em,
  p.atualizado_em,
  COUNT(m.id) as total_mensagens,
  MAX(m.criado_em) as ultima_mensagem_em
FROM chat_projetos p
LEFT JOIN chat_mensagens m ON m.projeto_id = p.id
GROUP BY p.id, p.user_id, p.nome, p.descricao, p.contexto, p.cor, p.criado_em, p.atualizado_em
ORDER BY p.atualizado_em DESC;
