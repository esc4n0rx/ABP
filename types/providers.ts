// Types para gerenciamento de providers de IA

export type ProviderName = 'groq' | 'gemini' | 'openai' | 'anthropic'

export interface AIProvider {
  id: string
  user_id: string
  provider_name: ProviderName
  api_key: string
  is_active: boolean
  is_default: boolean
  model_name?: string
  created_at: string
  updated_at: string
}

export interface AIModelConfig {
  id: string
  provider_id: string
  temperature: number
  max_tokens: number
  top_p: number
  created_at: string
  updated_at: string
}

export interface AIModelLimit {
  id: string
  provider_name: ProviderName
  model_name: string
  requests_per_minute: number
  requests_per_day: number
  tokens_per_minute: number
  tokens_per_day: number
  max_completion_tokens: number
  created_at: string
}

export interface AIUsageTracking {
  id: string
  user_id: string
  provider_id: string
  model_name: string
  tokens_used: number
  request_type: 'abap' | 'chat' | 'debug' | 'ef'
  created_at: string
}

// Request types para APIs
export interface CreateProviderRequest {
  provider_name: ProviderName
  api_key: string
  is_default?: boolean
  model_name?: string
}

export interface UpdateProviderRequest {
  api_key?: string
  is_active?: boolean
  is_default?: boolean
  model_name?: string
}

export interface ProviderConfigRequest {
  temperature?: number
  max_tokens?: number
  top_p?: number
}

// Response types
export interface ProvidersResponse {
  success: boolean
  data?: AIProvider[]
  error?: string
}

export interface ProviderResponse {
  success: boolean
  data?: AIProvider
  error?: string
}

export interface ModelLimitsResponse {
  success: boolean
  data?: AIModelLimit[]
  error?: string
}

// Modelo de informação para cada provider
export interface ProviderInfo {
  name: ProviderName
  displayName: string
  description: string
  models: ModelInfo[]
  requiresApiKey: boolean
  documentationUrl: string
}

export interface ModelInfo {
  id: string
  name: string
  description: string
  maxTokens: number
  contextWindow: number
  pricing?: {
    input: number // por 1M tokens
    output: number // por 1M tokens
  }
}

// Informações estáticas dos providers
export const PROVIDER_INFO: Record<ProviderName, ProviderInfo> = {
  groq: {
    name: 'groq',
    displayName: 'Groq (Free)',
    description: 'Provider gratuito com múltiplos modelos de alta performance',
    requiresApiKey: false,
    documentationUrl: 'https://console.groq.com/docs',
    models: [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        description: 'Modelo versátil e balanceado',
        maxTokens: 8000,
        contextWindow: 8192,
      },
      {
        id: 'qwen/qwen3-32b',
        name: 'Qwen 3 32B',
        description: 'Modelo otimizado para tarefas gerais',
        maxTokens: 4096,
        contextWindow: 4096,
      },
      {
        id: 'openai/gpt-oss-120b',
        name: 'GPT-OSS 120B',
        description: 'Modelo de código aberto de grande porte',
        maxTokens: 8192,
        contextWindow: 8192,
      },
      {
        id: 'moonshotai/kimi-k2-instruct-0905',
        name: 'Kimi K2 Instruct',
        description: 'Modelo instruído da MoonShot AI',
        maxTokens: 4096,
        contextWindow: 4096,
      },
    ],
  },
  gemini: {
    name: 'gemini',
    displayName: 'Google Gemini',
    description: 'Modelos avançados do Google com suporte multimodal',
    requiresApiKey: true,
    documentationUrl: 'https://ai.google.dev/docs',
    models: [
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        description: 'Modelo rápido e eficiente',
        maxTokens: 8192,
        contextWindow: 1000000,
        pricing: {
          input: 0,
          output: 0,
        },
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Modelo pro com contexto extenso',
        maxTokens: 8192,
        contextWindow: 2000000,
        pricing: {
          input: 1.25,
          output: 5.0,
        },
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Versão flash rápida e econômica',
        maxTokens: 8192,
        contextWindow: 1000000,
        pricing: {
          input: 0.075,
          output: 0.30,
        },
      },
    ],
  },
  openai: {
    name: 'openai',
    displayName: 'OpenAI GPT',
    description: 'Modelos GPT da OpenAI',
    requiresApiKey: true,
    documentationUrl: 'https://platform.openai.com/docs',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Modelo mais avançado e rápido',
        maxTokens: 16384,
        contextWindow: 128000,
        pricing: {
          input: 2.5,
          output: 10.0,
        },
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Versão compacta e econômica',
        maxTokens: 16384,
        contextWindow: 128000,
        pricing: {
          input: 0.15,
          output: 0.60,
        },
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'GPT-4 otimizado',
        maxTokens: 4096,
        contextWindow: 128000,
        pricing: {
          input: 10.0,
          output: 30.0,
        },
      },
    ],
  },
  anthropic: {
    name: 'anthropic',
    displayName: 'Anthropic Claude',
    description: 'Família de modelos Claude com raciocínio avançado',
    requiresApiKey: true,
    documentationUrl: 'https://docs.anthropic.com',
    models: [
      {
        id: 'claude-sonnet-4-5-20250929',
        name: 'Claude Sonnet 4.5',
        description: 'Modelo mais recente e avançado',
        maxTokens: 8192,
        contextWindow: 200000,
        pricing: {
          input: 3.0,
          output: 15.0,
        },
      },
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet',
        description: 'Excelente balanço qualidade/preço',
        maxTokens: 8192,
        contextWindow: 200000,
        pricing: {
          input: 3.0,
          output: 15.0,
        },
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        description: 'Rápido e econômico',
        maxTokens: 8192,
        contextWindow: 200000,
        pricing: {
          input: 0.8,
          output: 4.0,
        },
      },
    ],
  },
}

// Tipo para configuração de chamada de IA
export interface AICallConfig {
  provider: ProviderName
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
  stream?: boolean
}

// Tipo para resposta unificada de IA
export interface AIResponse {
  content: string
  finishReason?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// Tipo para streaming de IA
export interface AIStreamChunk {
  content: string
  done: boolean
}
