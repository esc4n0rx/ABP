-- Tabela para armazenar análises de debug SAP
CREATE TABLE IF NOT EXISTS public.analises_debug (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo de análise
  tipo_analise TEXT NOT NULL CHECK (tipo_analise IN ('SMQ2', 'ABAP', 'CENARIO')),

  -- Metadados
  titulo TEXT NOT NULL,

  -- Dados de entrada (JSON com os dados específicos de cada tipo)
  dados_entrada JSONB NOT NULL,

  -- Resposta da IA (JSON com a solução)
  resposta_ia JSONB NOT NULL,

  -- Status da análise
  status TEXT NOT NULL DEFAULT 'analisado' CHECK (status IN ('analisado', 'resolvido', 'pendente')),

  -- Timestamps
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_analises_debug_user_id ON public.analises_debug(user_id);
CREATE INDEX IF NOT EXISTS idx_analises_debug_tipo ON public.analises_debug(tipo_analise);
CREATE INDEX IF NOT EXISTS idx_analises_debug_status ON public.analises_debug(status);
CREATE INDEX IF NOT EXISTS idx_analises_debug_criado_em ON public.analises_debug(criado_em DESC);

-- RLS (Row Level Security)
ALTER TABLE public.analises_debug ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias análises
CREATE POLICY "Users can view own debug analyses"
  ON public.analises_debug
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias análises
CREATE POLICY "Users can insert own debug analyses"
  ON public.analises_debug
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias análises
CREATE POLICY "Users can update own debug analyses"
  ON public.analises_debug
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias análises
CREATE POLICY "Users can delete own debug analyses"
  ON public.analises_debug
  FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar o timestamp atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_analises_debug_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar atualizado_em
CREATE TRIGGER trigger_update_analises_debug_updated_at
  BEFORE UPDATE ON public.analises_debug
  FOR EACH ROW
  EXECUTE FUNCTION update_analises_debug_updated_at();

-- Comentários na tabela
COMMENT ON TABLE public.analises_debug IS 'Armazena análises de debug SAP realizadas pela IA';
COMMENT ON COLUMN public.analises_debug.tipo_analise IS 'Tipo de análise: SMQ2, ABAP ou CENARIO';
COMMENT ON COLUMN public.analises_debug.dados_entrada IS 'JSON com os dados específicos de entrada para cada tipo de análise';
COMMENT ON COLUMN public.analises_debug.resposta_ia IS 'JSON com a resposta/solução fornecida pela IA';
COMMENT ON COLUMN public.analises_debug.status IS 'Status da análise: analisado, resolvido ou pendente';
