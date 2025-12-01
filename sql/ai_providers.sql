-- Tabela de configuração de providers de IA
-- Armazena as chaves de API e preferências dos usuários para diferentes provedores de IA

CREATE TABLE IF NOT EXISTS public.ai_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name VARCHAR(50) NOT NULL CHECK (provider_name IN ('groq', 'gemini', 'openai', 'anthropic')),
  api_key TEXT NOT NULL, -- Chave criptografada
  is_active BOOLEAN DEFAULT false, -- Se este provider está ativo para uso
  is_default BOOLEAN DEFAULT false, -- Se este é o provider padrão do usuário
  model_name VARCHAR(100), -- Modelo específico a usar (ex: llama-3.3-70b-versatile, gpt-4, etc)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_user_provider FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Tabela para armazenar configurações avançadas dos modelos
CREATE TABLE IF NOT EXISTS public.ai_model_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  top_p DECIMAL(3,2) DEFAULT 0.9,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_provider_config FOREIGN KEY (provider_id) REFERENCES public.ai_providers(id)
);

-- Tabela de uso e limites dos modelos (baseado nos json_models)
CREATE TABLE IF NOT EXISTS public.ai_model_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_name VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  requests_per_minute INTEGER,
  requests_per_day INTEGER,
  tokens_per_minute INTEGER,
  tokens_per_day INTEGER,
  max_completion_tokens INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_model UNIQUE (provider_name, model_name)
);

-- Tabela de tracking de uso
CREATE TABLE IF NOT EXISTS public.ai_usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  model_name VARCHAR(100) NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  request_type VARCHAR(50), -- 'abap', 'chat', 'debug', 'ef'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_user_usage FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_provider_usage FOREIGN KEY (provider_id) REFERENCES public.ai_providers(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_providers_user_id ON public.ai_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON public.ai_providers(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_providers_default ON public.ai_providers(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON public.ai_usage_tracking(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_provider ON public.ai_usage_tracking(provider_id, created_at);

-- RLS (Row Level Security)
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_providers
CREATE POLICY "Usuários podem ver seus próprios providers"
  ON public.ai_providers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios providers"
  ON public.ai_providers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios providers"
  ON public.ai_providers
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios providers"
  ON public.ai_providers
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para ai_model_configs
CREATE POLICY "Usuários podem ver configs de seus providers"
  ON public.ai_model_configs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_providers
      WHERE ai_providers.id = ai_model_configs.provider_id
      AND ai_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar configs de seus providers"
  ON public.ai_model_configs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_providers
      WHERE ai_providers.id = ai_model_configs.provider_id
      AND ai_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar configs de seus providers"
  ON public.ai_model_configs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_providers
      WHERE ai_providers.id = ai_model_configs.provider_id
      AND ai_providers.user_id = auth.uid()
    )
  );

-- Políticas para ai_usage_tracking
CREATE POLICY "Usuários podem ver seu próprio uso"
  ON public.ai_usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar registros de uso"
  ON public.ai_usage_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_ai_provider_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER trigger_ai_providers_updated_at
  BEFORE UPDATE ON public.ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ai_provider_updated_at();

CREATE TRIGGER trigger_ai_model_configs_updated_at
  BEFORE UPDATE ON public.ai_model_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ai_provider_updated_at();

-- Função para garantir apenas um provider padrão por usuário
CREATE OR REPLACE FUNCTION public.ensure_single_default_provider()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Remove o padrão de outros providers do mesmo usuário
    UPDATE public.ai_providers
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default
  BEFORE INSERT OR UPDATE ON public.ai_providers
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.ensure_single_default_provider();

-- Inserir limites dos modelos Groq baseado nos json_models
INSERT INTO public.ai_model_limits (provider_name, model_name, requests_per_minute, requests_per_day, tokens_per_minute, tokens_per_day, max_completion_tokens)
VALUES
  ('groq', 'qwen/qwen3-32b', 60, 1000, 6000, 500000, 4096),
  ('groq', 'openai/gpt-oss-120b', 30, 1000, 8000, 200000, 8192),
  ('groq', 'moonshotai/kimi-k2-instruct-0905', 60, 1000, 10000, 300000, 4096),
  ('groq', 'llama-3.3-70b-versatile', 30, 14400, 20000, 500000, 8000)
ON CONFLICT (provider_name, model_name) DO NOTHING;

-- View para estatísticas de uso
CREATE OR REPLACE VIEW ai_usage_stats AS
SELECT
  u.user_id,
  p.provider_name,
  u.model_name,
  COUNT(*) as total_requests,
  SUM(u.tokens_used) as total_tokens,
  DATE(u.created_at) as usage_date
FROM ai_usage_tracking u
JOIN ai_providers p ON p.id = u.provider_id
GROUP BY u.user_id, p.provider_name, u.model_name, DATE(u.created_at);

-- Comentários nas tabelas
COMMENT ON TABLE public.ai_providers IS 'Configuração de provedores de IA por usuário';
COMMENT ON TABLE public.ai_model_configs IS 'Configurações avançadas dos modelos de IA';
COMMENT ON TABLE public.ai_model_limits IS 'Limites de uso dos modelos de IA';
COMMENT ON TABLE public.ai_usage_tracking IS 'Tracking de uso de APIs de IA';
