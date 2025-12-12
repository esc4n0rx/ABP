-- Tabela de configuração de geração de código ABAP
-- Armazena preferências dos usuários para geração de código ABAP (OO vs Puro)

CREATE TABLE IF NOT EXISTS public.abap_generation_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estilo_codigo VARCHAR(50) NOT NULL DEFAULT 'oo' CHECK (estilo_codigo IN ('oo', 'puro')),
  usar_clean_code BOOLEAN DEFAULT true,
  usar_performance_otimizada BOOLEAN DEFAULT true,
  usar_tratamento_erros BOOLEAN DEFAULT true,
  usar_documentacao_inline BOOLEAN DEFAULT true,
  nivel_complexidade VARCHAR(50) DEFAULT 'medio' CHECK (nivel_complexidade IN ('simples', 'medio', 'avancado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Garante que cada usuário tenha apenas uma configuração
  CONSTRAINT unique_user_config UNIQUE (user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_abap_config_user_id ON public.abap_generation_config(user_id);
CREATE INDEX IF NOT EXISTS idx_abap_config_estilo ON public.abap_generation_config(user_id, estilo_codigo);

-- RLS (Row Level Security)
ALTER TABLE public.abap_generation_config ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver suas próprias configurações"
  ON public.abap_generation_config
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias configurações"
  ON public.abap_generation_config
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
  ON public.abap_generation_config
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias configurações"
  ON public.abap_generation_config
  FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_abap_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_abap_config_updated_at
  BEFORE UPDATE ON public.abap_generation_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_abap_config_updated_at();

-- Função para criar configuração padrão para novos usuários
CREATE OR REPLACE FUNCTION public.create_default_abap_config()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.abap_generation_config (user_id, estilo_codigo)
  VALUES (NEW.id, 'oo')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar configuração padrão automaticamente
-- (Opcional - comentado por enquanto, pode ser ativado se necessário)
-- CREATE TRIGGER trigger_create_default_abap_config
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.create_default_abap_config();

-- Comentário na tabela
COMMENT ON TABLE public.abap_generation_config IS 'Configurações de geração de código ABAP por usuário';
COMMENT ON COLUMN public.abap_generation_config.estilo_codigo IS 'Estilo de código: oo (Orientado a Objetos) ou puro (ABAP Procedural)';
COMMENT ON COLUMN public.abap_generation_config.usar_clean_code IS 'Aplicar princípios de Clean Code';
COMMENT ON COLUMN public.abap_generation_config.usar_performance_otimizada IS 'Otimizar código para performance';
COMMENT ON COLUMN public.abap_generation_config.usar_tratamento_erros IS 'Incluir tratamento de erros completo';
COMMENT ON COLUMN public.abap_generation_config.usar_documentacao_inline IS 'Adicionar documentação inline no código';
COMMENT ON COLUMN public.abap_generation_config.nivel_complexidade IS 'Nível de complexidade do código gerado';
