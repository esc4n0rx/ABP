// Tipos de análise de debug
export type TipoAnaliseDebug = "SMQ2" | "ABAP" | "CENARIO"

// Dados para análise SMQ2
export interface AnaliseSMQ2Data {
  tipo: "SMQ2"
  nome_funcao: string
  nome_fila: string
  detalhes_ocorrencia: string
  quando_aconteceu: string
  dados_adicionais?: string
}

// Dados para análise ABAP
export interface AnaliseABAPData {
  tipo: "ABAP"
  nome_programa: string
  tipo_objeto: "REPORT" | "FUNCTION" | "CLASS" | "INCLUDE" | "FORM" | "OUTRO"
  descricao_problema: string
  codigo_abap: string
  mensagem_erro?: string
  dump?: string
}

// Dados para análise de cenário específico
export interface AnaliseCenarioData {
  tipo: "CENARIO"
  transacao: string
  descricao_cenario: string
  descricao_problema: string
  mensagem_erro?: string // Mensagem de erro para buscar notas SAP
  programa_customizado?: string // Apenas se transação começar com Z ou Y
  passos_reproducao?: string
  dados_entrada?: string
}

// União de todos os tipos de análise
export type AnaliseDebugData = AnaliseSMQ2Data | AnaliseABAPData | AnaliseCenarioData

// Link de nota SAP retornado pela API
export interface NotaSAPLink {
  titulo: string
  link: string
  fonte?: string
}

// Resposta da IA para análise de debug
export interface RespostaDebugIA {
  tipo: "solucao"
  titulo: string
  resumo_problema: string
  causa_raiz: string
  solucao: {
    passos: string[]
    codigo_correcao?: string
    configuracoes?: string[]
    observacoes?: string[]
  }
  prevencao: string[]
  recursos_adicionais?: {
    notas_sap?: string[]
    notas_sap_links?: NotaSAPLink[] // Links reais das notas SAP da API
    transacoes_uteis?: string[]
    documentacao?: string[]
  }
  nivel_criticidade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA"
  tempo_estimado: string
}

// Análise salva no banco
export interface AnaliseDebugSalva {
  id: string
  user_id: string
  tipo_analise: TipoAnaliseDebug
  titulo: string
  dados_entrada: AnaliseDebugData
  resposta_ia: RespostaDebugIA
  status: "analisado" | "resolvido" | "pendente"
  criado_em: string
  atualizado_em: string
}

// Item da lista de análises
export interface AnaliseDebugListItem {
  id: string
  tipo_analise: TipoAnaliseDebug
  titulo: string
  resumo: string
  nivel_criticidade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA"
  status: "analisado" | "resolvido" | "pendente"
  criado_em: string
}

// Request para API de análise
export interface AnaliseDebugRequest {
  dados: AnaliseDebugData
}

// Response da API
export interface AnaliseDebugResponse {
  success: boolean
  data?: RespostaDebugIA
  error?: string
}

// Labels para tipos de objeto ABAP
export const TIPOS_OBJETO_ABAP = [
  { value: "REPORT", label: "Report/Programa" },
  { value: "FUNCTION", label: "Function Module" },
  { value: "CLASS", label: "Classe ABAP" },
  { value: "INCLUDE", label: "Include" },
  { value: "FORM", label: "Form/Subroutine" },
  { value: "OUTRO", label: "Outro" },
] as const

// Helper para verificar se transação é customizada
export function isTransacaoCustomizada(transacao: string): boolean {
  const tranUpper = transacao.trim().toUpperCase()
  return tranUpper.startsWith("Z") || tranUpper.startsWith("Y")
}

// Helper para obter cor da criticidade
export function getCorCriticidade(nivel: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA"): string {
  switch (nivel) {
    case "BAIXA":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "MEDIA":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "ALTA":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "CRITICA":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

// Helper para obter ícone da criticidade
export function getIconeCriticidade(nivel: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA"): string {
  switch (nivel) {
    case "BAIXA":
      return "ℹ️"
    case "MEDIA":
      return "⚠️"
    case "ALTA":
      return "🔥"
    case "CRITICA":
      return "🚨"
    default:
      return "❓"
  }
}

// Helper para obter label do tipo de análise
export function getLabelTipoAnalise(tipo: TipoAnaliseDebug): string {
  switch (tipo) {
    case "SMQ2":
      return "Análise SMQ2"
    case "ABAP":
      return "Análise ABAP"
    case "CENARIO":
      return "Análise de Cenário"
    default:
      return "Análise"
  }
}
