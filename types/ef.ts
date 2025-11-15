export interface EspecificacaoFuncional {
  id?: string
  user_id?: string
  titulo: string
  versao: string
  descricao: string
  status?: 'rascunho' | 'refinado' | 'publicado'

  modulo_sap: string
  data_criacao?: string
  empresa: string
  tipo_programa: string

  visao_geral: string
  motivo_ef: string
  especificacao_detalhada: string

  conteudo_refinado?: EFRefinada | null

  criado_em?: string
  atualizado_em?: string
}

export interface MembroEquipe {
  id?: string
  ef_id?: string
  nome: string
  cargo: string
  email?: string
  criado_em?: string
}

export interface TabelaSAP {
  id?: string
  ef_id?: string
  nome_tabela: string
  descricao: string
  tipo: string
  criado_em?: string
}

export interface ModuloSAP {
  id?: string
  ef_id?: string
  nome_modulo: string
  descricao: string
  tipo: string
  criado_em?: string
}

export interface EFRefinada {
  informacoes_basicas: {
    titulo: string
    versao: string
    autor: string
    descricao: string
    data_criacao: string
    empresa: string
  }

  dados_sap: {
    modulo: string
    tipo_programa: string
  }

  equipe: Array<{
    nome: string
    cargo: string
    email?: string
  }>

  visao_geral: {
    descricao: string
    motivo: string
    objetivos: string[]
  }

  especificacao: {
    introducao: string
    processos: Array<{
      nome: string
      descricao: string
      passos: string[]
    }>
    regras_negocio: string[]
    consideracoes_tecnicas: string[]
  }

  recursos_tecnicos: {
    tabelas: Array<{
      nome: string
      descricao: string
      tipo: string
    }>
    modulos: Array<{
      nome: string
      descricao: string
      tipo: string
    }>
  }

  observacoes?: {
    notas_importantes?: string[]
    proximos_passos?: string[]
    referencias?: string[]
  }
}

export interface EFFormData {
  titulo: string
  versao: string
  autor: string
  descricao: string

  modulo_sap: string
  data_criacao: string
  empresa: string
  tipo_programa: string

  equipe: MembroEquipe[]

  visao_geral: string
  motivo_ef: string

  especificacao_detalhada: string

  tabelas: TabelaSAP[]
  modulos: ModuloSAP[]
}

export interface EFStats {
  total_efs: number
  efs_publicadas: number
  efs_refinadas: number
  efs_rascunho: number
  efs_recentes: number
  ultima_ef_criada: string | null
}

export const MODULOS_SAP = [
  { value: 'SD', label: 'SD - Sales and Distribution' },
  { value: 'MM', label: 'MM - Materials Management' },
  { value: 'FI', label: 'FI - Financial Accounting' },
  { value: 'CO', label: 'CO - Controlling' },
  { value: 'PP', label: 'PP - Production Planning' },
  { value: 'QM', label: 'QM - Quality Management' },
  { value: 'PM', label: 'PM - Plant Maintenance' },
  { value: 'HR', label: 'HR - Human Resources' },
  { value: 'PS', label: 'PS - Project System' },
  { value: 'WM', label: 'WM - Warehouse Management' },
  { value: 'LE', label: 'LE - Logistics Execution' },
  { value: 'BASIS', label: 'BASIS - SAP Basis' },
  { value: 'ABAP', label: 'ABAP - Development' },
  { value: 'BW', label: 'BW - Business Warehouse' },
  { value: 'CRM', label: 'CRM - Customer Relationship Management' },
  { value: 'SRM', label: 'SRM - Supplier Relationship Management' },
] as const

export const TIPOS_PROGRAMA = [
  { value: 'REPORT', label: 'Report/Programa' },
  { value: 'FUNCTION', label: 'Function Module' },
  { value: 'CLASS', label: 'Class/Método' },
  { value: 'ENHANCEMENT', label: 'Enhancement/User Exit' },
  { value: 'BADI', label: 'BADI Implementation' },
  { value: 'WORKFLOW', label: 'Workflow' },
  { value: 'SMARTFORM', label: 'Smartform' },
  { value: 'SAPSCRIPT', label: 'SAPScript' },
  { value: 'ALV', label: 'ALV Report' },
  { value: 'DIALOG', label: 'Dialog Programming' },
  { value: 'INTERFACE', label: 'Interface/RFC' },
  { value: 'WEBSERVICE', label: 'Web Service' },
  { value: 'ODATA', label: 'OData Service' },
  { value: 'FIORI', label: 'Fiori App' },
  { value: 'OTHERS', label: 'Outros' },
] as const

export const TIPOS_TABELA = [
  { value: 'STANDARD', label: 'Tabela Padrão SAP' },
  { value: 'ZTABLE', label: 'Z-Table (Customizada)' },
  { value: 'YTABLE', label: 'Y-Table (Customizada)' },
  { value: 'VIEW', label: 'View' },
  { value: 'TRANSPARENT', label: 'Transparent Table' },
  { value: 'CLUSTER', label: 'Cluster Table' },
  { value: 'POOLED', label: 'Pooled Table' },
] as const

export const TIPOS_MODULO = [
  { value: 'FM', label: 'Function Module' },
  { value: 'CLASS', label: 'Class/Interface' },
  { value: 'PROGRAM', label: 'Program' },
  { value: 'TRANSACTION', label: 'Transaction Code' },
  { value: 'INCLUDE', label: 'Include Program' },
  { value: 'RFC', label: 'RFC Function' },
  { value: 'BAPI', label: 'BAPI' },
  { value: 'METHOD', label: 'Method' },
] as const

export const CARGOS_EQUIPE = [
  'Analista de Negócios',
  'Consultor Funcional',
  'Desenvolvedor ABAP',
  'Arquiteto SAP',
  'Gerente de Projeto',
  'Product Owner',
  'Scrum Master',
  'Analista de Testes',
  'Consultor Basis',
  'Consultor Técnico',
  'Tech Lead',
  'Coordenador',
] as const
