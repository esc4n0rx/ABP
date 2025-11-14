// Types para Chat

export interface ChatProjeto {
  id?: string
  user_id?: string
  nome: string
  descricao?: string
  contexto?: string
  cor?: string
  criado_em?: string
  atualizado_em?: string
  total_mensagens?: number
  ultima_mensagem_em?: string
}

export interface ChatMensagem {
  id?: string
  user_id?: string
  projeto_id?: string | null
  role: 'user' | 'assistant' | 'system'
  conteudo: string
  conteudo_limpo?: string
  tokens_usados?: number
  criado_em?: string
}

export interface ChatStats {
  total_projetos: number
  total_mensagens_usuario: number
  total_mensagens_ia: number
  total_tokens_usados: number
  ultima_mensagem: string | null
}

// Cores disponíveis para projetos
export const CORES_PROJETO = [
  { value: '#2b6cfd', label: 'Azul' },
  { value: '#5aa9ff', label: 'Azul Claro' },
  { value: '#00cfff', label: 'Ciano' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Laranja' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#6366f1', label: 'Índigo' },
  { value: '#14b8a6', label: 'Teal' },
] as const

// Interface para histórico de conversa
export interface ChatHistorico {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Interface para request de chat
export interface ChatRequest {
  mensagem: string
  projeto_id?: string | null
  contexto_projeto?: string
  historico?: ChatHistorico[]
}

// Interface para response de chat (stream)
export interface ChatStreamChunk {
  type: 'token' | 'done' | 'error'
  content?: string
  error?: string
  mensagem_id?: string
}
