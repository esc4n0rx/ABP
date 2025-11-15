export interface ProgramaABAP {
  id?: string
  user_id?: string
  nome_programa: string
  tipo_programa: TipoProgramaABAP
  descricao: string
  status?: 'rascunho' | 'gerado' | 'refinado'

  objetivo: string
  logica_negocio?: string
  especificacao?: string

  tabelas?: TabelaABAP[]
  campos?: CampoABAP[]
  funcoes_modulos?: FuncaoModuloABAP[]

  codigo_gerado?: CodigoGerado | null

  ef_upload?: string | null 
  ef_arquivo?: string | null 

  perguntas_ia?: PerguntaIA[] | null
  respostas_usuario?: RespostaUsuario[] | null

  criado_em?: string
  atualizado_em?: string
}

export type TipoProgramaABAP =
  | 'REPORT'           // Relatório
  | 'ALV_REPORT'       // Relatório ALV
  | 'INTERACTIVE_REPORT' // Relatório Interativo
  | 'CDS_VIEW'         // CDS View
  | 'AMDP'             // ABAP Managed Database Procedures
  | 'FUNCTION_MODULE'  // Módulo de Função
  | 'RFC_FUNCTION'     // RFC Function Module
  | 'CLASS'            // Classe ABAP
  | 'INTERFACE'        // Interface
  | 'BADI'             // Business Add-In
  | 'ENHANCEMENT'      // Enhancement Implementation
  | 'USER_EXIT'        // User Exit
  | 'BTE'              // Business Transaction Events
  | 'WORKFLOW'         // Workflow
  | 'SMARTFORM'        // Smartform
  | 'ADOBE_FORM'       // Adobe Form
  | 'SAPSCRIPT'        // SAPScript
  | 'DIALOG_PROGRAM'   // Dialog Programming (Dynpro)
  | 'MODULE_POOL'      // Module Pool
  | 'BDC'              // Batch Data Communication
  | 'LSMW'             // Legacy System Migration Workbench
  | 'IDOC'             // IDoc Processing
  | 'WEBSERVICE'       // Web Service
  | 'ODATA_SERVICE'    // OData Service
  | 'RAP'              // RESTful ABAP Programming
  | 'FIORI_ELEMENTS'   // Fiori Elements App
  | 'INCLUDE'          // Include Program
  | 'SUBROUTINE'       // Subroutine Pool
  | 'TYPE_POOL'        // Type Pool
  | 'OTHERS'           // Outros

export const TIPOS_PROGRAMA_ABAP: Array<{
  value: TipoProgramaABAP
  label: string
  categoria: 'report' | 'oo' | 'enhancement' | 'form' | 'integration' | 'fiori' | 'others'
  descricao: string
}> = [

  { value: 'REPORT', label: 'Relatório ABAP', categoria: 'report', descricao: 'Relatório tradicional com tela de seleção' },
  { value: 'ALV_REPORT', label: 'Relatório ALV', categoria: 'report', descricao: 'Relatório com ALV Grid/List' },
  { value: 'INTERACTIVE_REPORT', label: 'Relatório Interativo', categoria: 'report', descricao: 'Relatório com interatividade e drill-down' },


  { value: 'CDS_VIEW', label: 'CDS View', categoria: 'report', descricao: 'Core Data Services View' },
  { value: 'AMDP', label: 'AMDP', categoria: 'oo', descricao: 'ABAP Managed Database Procedures' },


  { value: 'CLASS', label: 'Classe ABAP', categoria: 'oo', descricao: 'Classe com métodos e atributos' },
  { value: 'INTERFACE', label: 'Interface', categoria: 'oo', descricao: 'Interface ABAP' },


  { value: 'FUNCTION_MODULE', label: 'Módulo de Função', categoria: 'others', descricao: 'Function Module padrão' },
  { value: 'RFC_FUNCTION', label: 'RFC Function', categoria: 'integration', descricao: 'Function Module habilitado para RFC' },


  { value: 'BADI', label: 'BADI', categoria: 'enhancement', descricao: 'Business Add-In Implementation' },
  { value: 'ENHANCEMENT', label: 'Enhancement', categoria: 'enhancement', descricao: 'Enhancement Implementation' },
  { value: 'USER_EXIT', label: 'User Exit', categoria: 'enhancement', descricao: 'User Exit Implementation' },
  { value: 'BTE', label: 'BTE', categoria: 'enhancement', descricao: 'Business Transaction Events' },


  { value: 'SMARTFORM', label: 'Smartform', categoria: 'form', descricao: 'Smartform para impressão' },
  { value: 'ADOBE_FORM', label: 'Adobe Form', categoria: 'form', descricao: 'Adobe Interactive Form' },
  { value: 'SAPSCRIPT', label: 'SAPScript', categoria: 'form', descricao: 'SAPScript Form' },


  { value: 'DIALOG_PROGRAM', label: 'Programa de Diálogo', categoria: 'others', descricao: 'Dialog Programming com Dynpro' },
  { value: 'MODULE_POOL', label: 'Module Pool', categoria: 'others', descricao: 'Module Pool Program' },


  { value: 'BDC', label: 'BDC', categoria: 'integration', descricao: 'Batch Data Communication' },
  { value: 'LSMW', label: 'LSMW', categoria: 'integration', descricao: 'Legacy System Migration Workbench' },
  { value: 'IDOC', label: 'IDoc', categoria: 'integration', descricao: 'IDoc Processing Program' },
  { value: 'WEBSERVICE', label: 'Web Service', categoria: 'integration', descricao: 'Web Service ABAP' },
  { value: 'ODATA_SERVICE', label: 'OData Service', categoria: 'integration', descricao: 'OData Service' },


  { value: 'RAP', label: 'RAP (RESTful ABAP)', categoria: 'fiori', descricao: 'RESTful ABAP Programming' },
  { value: 'FIORI_ELEMENTS', label: 'Fiori Elements', categoria: 'fiori', descricao: 'Fiori Elements Application' },


  { value: 'WORKFLOW', label: 'Workflow', categoria: 'others', descricao: 'Workflow Implementation' },

  { value: 'INCLUDE', label: 'Include Program', categoria: 'others', descricao: 'Include para reutilização de código' },
  { value: 'SUBROUTINE', label: 'Subroutine Pool', categoria: 'others', descricao: 'Pool de Subroutines' },
  { value: 'TYPE_POOL', label: 'Type Pool', categoria: 'others', descricao: 'Type Pool para tipos globais' },
  { value: 'OTHERS', label: 'Outros', categoria: 'others', descricao: 'Outros tipos de programas' },
] as const


export interface TabelaABAP {
  id?: string
  programa_id?: string
  nome_tabela: string
  descricao: string
  tipo: TipoTabelaABAP
  alias?: string 
  campos_usados?: string[]
  criado_em?: string
}

export type TipoTabelaABAP =
  | 'STANDARD'      // Tabela Padrão SAP
  | 'ZTABLE'        // Z-Table Customizada
  | 'YTABLE'        // Y-Table Customizada
  | 'VIEW'          // View
  | 'CDS_VIEW'      // CDS View
  | 'TRANSPARENT'   // Transparent Table
  | 'CLUSTER'       // Cluster Table
  | 'POOLED'        // Pooled Table
  | 'INTERNAL'      // Internal Table

export const TIPOS_TABELA_ABAP = [
  { value: 'STANDARD', label: 'Tabela Padrão SAP' },
  { value: 'ZTABLE', label: 'Z-Table (Customizada)' },
  { value: 'YTABLE', label: 'Y-Table (Customizada)' },
  { value: 'VIEW', label: 'View de Banco' },
  { value: 'CDS_VIEW', label: 'CDS View' },
  { value: 'TRANSPARENT', label: 'Transparent Table' },
  { value: 'CLUSTER', label: 'Cluster Table' },
  { value: 'POOLED', label: 'Pooled Table' },
  { value: 'INTERNAL', label: 'Internal Table' },
] as const

export interface CampoABAP {
  id?: string
  programa_id?: string
  nome_campo: string
  tabela?: string
  descricao: string
  tipo_dado: string
  tamanho?: number
  obrigatorio?: boolean
  criado_em?: string
}

export interface FuncaoModuloABAP {
  id?: string
  programa_id?: string
  nome: string
  tipo: TipoFuncaoModulo
  descricao: string
  parametros?: string
  criado_em?: string
}

export type TipoFuncaoModulo =
  | 'FM'            // Function Module
  | 'RFC'           // RFC Function
  | 'BAPI'          // BAPI
  | 'METHOD'        // Method de Classe
  | 'CLASS'         // Classe
  | 'INCLUDE'       // Include
  | 'SUBROUTINE'    // Subroutine/Form
  | 'MACRO'         // Macro

export const TIPOS_FUNCAO_MODULO = [
  { value: 'FM', label: 'Function Module' },
  { value: 'RFC', label: 'RFC Function' },
  { value: 'BAPI', label: 'BAPI' },
  { value: 'METHOD', label: 'Method' },
  { value: 'CLASS', label: 'Classe' },
  { value: 'INCLUDE', label: 'Include' },
  { value: 'SUBROUTINE', label: 'Subroutine/Form' },
  { value: 'MACRO', label: 'Macro' },
] as const

export interface CodigoGerado {

  codigo_principal: string

  
  codigos_adicionais?: Array<{
    tipo: string 
    nome: string
    codigo: string
    descricao?: string
  }>

  documentacao?: {
    descricao_geral: string
    como_usar: string
    parametros?: string[]
    consideracoes?: string[]
    exemplos?: string[]
  }

  configuracoes?: {
    transacoes?: string[]
    autorizacoes?: string[]
    customizacoes?: string[]
  }

  dependencias?: {
    tabelas?: string[]
    funcoes?: string[]
    classes?: string[]
    includes?: string[]
  }

  testes_sugeridos?: string[]

  gerado_em?: string
  modelo_usado?: string
  versao?: string
}

export interface PerguntaIA {
  id: string
  pergunta: string
  contexto?: string
  tipo?: 'clarificacao' | 'complemento' | 'validacao'
  criado_em?: string
}

export interface RespostaUsuario {
  pergunta_id: string
  resposta: string
  criado_em?: string
}

export interface RespostaComPerguntas {
  tipo: 'perguntas'
  perguntas: Array<{
    pergunta: string
    contexto?: string
  }>
  mensagem: string
}


export interface AbapFormData {
  modo_criacao: 'upload' | 'manual'

  ef_arquivo?: File | null
  ef_texto?: string

  tipo_programa: TipoProgramaABAP

  nome_programa: string
  objetivo: string

  logica_negocio: string
  processos?: string[] 
  regras_negocio?: string[]

  tabelas: TabelaABAP[]
  campos: CampoABAP[]
  funcoes_modulos: FuncaoModuloABAP[]

  contexto_especifico?: Record<string, any>
}

export interface ContextoReport {
  tem_tela_selecao: boolean
  campos_selecao?: Array<{
    nome: string
    tipo: string
    obrigatorio: boolean
  }>
  tipo_saida: 'lista' | 'alv' | 'arquivo' | 'email'
  tem_variantes: boolean
}

export interface ContextoALV {
  tipo_alv: 'grid' | 'list' | 'tree' | 'hierseq'
  tem_layout_padrao: boolean
  tem_filtros: boolean
  tem_totalizacao: boolean
  campos_hotspot?: string[]
  tem_edicao: boolean
}

export interface ContextoCDS {
  tipo_cds: 'view' | 'table_function' | 'hierarchy' | 'projection'
  base_tables: string[]
  tem_associacoes: boolean
  tem_anotacoes: boolean
  expose_odata: boolean
}

export interface ContextoBADI {
  badi_name: string
  interface_name: string
  metodos: Array<{
    nome: string
    descricao: string
  }>
  filtros?: string[]
}

export interface ContextoFunctionModule {
  function_group: string
  tem_rfc: boolean
  tem_update_task: boolean
  importing?: Array<{ nome: string; tipo: string; obrigatorio: boolean }>
  exporting?: Array<{ nome: string; tipo: string }>
  changing?: Array<{ nome: string; tipo: string }>
  tables?: Array<{ nome: string; tipo: string }>
  exceptions?: string[]
}

export interface ContextoClass {
  tipo_classe: 'normal' | 'singleton' | 'abstract' | 'final'
  heranca?: string
  interfaces?: string[]
  metodos_publicos?: Array<{
    nome: string
    descricao: string
    importing?: string[]
    exporting?: string[]
    returning?: string
  }>
  atributos?: Array<{
    nome: string
    tipo: string
    visibilidade: 'public' | 'protected' | 'private'
    read_only?: boolean
  }>
}

export interface ContextoSmartform {
  tipo_saida: 'impressora' | 'pdf' | 'email' | 'fax'
  tem_logo: boolean
  tem_codigo_barras: boolean
  num_paginas_estimado: number
  orientacao: 'retrato' | 'paisagem'
  formato_papel: 'A4' | 'A3' | 'LETTER' | 'LEGAL'
}

export interface ContextoBDC {
  modo_execucao: 'foreground' | 'background' | 'display_errors'
  transacao: string
  origem_dados: 'arquivo' | 'tabela' | 'webservice'
  tem_validacao: boolean
  tem_log: boolean
}

export interface ContextoOData {
  versao_odata: 'V2' | 'V4'
  entidades: Array<{
    nome: string
    tabela_base: string
    operacoes: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>
  }>
  tem_filtros: boolean
  tem_paginacao: boolean
  tem_autenticacao: boolean
}

export interface AbapStats {
  total_programas: number
  programas_gerados: number
  programas_refinados: number
  programas_rascunho: number
  programas_recentes: number
  ultima_geracao: string | null
  tipos_mais_usados?: Array<{
    tipo: TipoProgramaABAP
    count: number
  }>
}

export interface ProgramaABAPListItem {
  id: string
  nome_programa: string
  tipo_programa: TipoProgramaABAP
  descricao: string
  status: 'rascunho' | 'gerado' | 'refinado'
  criado_em: string
  atualizado_em: string
}

export const CAMPOS_OBRIGATORIOS_POR_TIPO: Record<TipoProgramaABAP, string[]> = {
  REPORT: ['nome_programa', 'objetivo', 'logica_negocio', 'tabelas'],
  ALV_REPORT: ['nome_programa', 'objetivo', 'logica_negocio', 'tabelas'],
  INTERACTIVE_REPORT: ['nome_programa', 'objetivo', 'logica_negocio', 'tabelas'],
  CDS_VIEW: ['nome_programa', 'objetivo', 'tabelas'],
  AMDP: ['nome_programa', 'objetivo', 'tabelas', 'logica_negocio'],
  FUNCTION_MODULE: ['nome_programa', 'objetivo', 'logica_negocio'],
  RFC_FUNCTION: ['nome_programa', 'objetivo', 'logica_negocio'],
  CLASS: ['nome_programa', 'objetivo'],
  INTERFACE: ['nome_programa', 'objetivo'],
  BADI: ['nome_programa', 'objetivo', 'logica_negocio'],
  ENHANCEMENT: ['nome_programa', 'objetivo', 'logica_negocio'],
  USER_EXIT: ['nome_programa', 'objetivo', 'logica_negocio'],
  BTE: ['nome_programa', 'objetivo', 'logica_negocio'],
  WORKFLOW: ['nome_programa', 'objetivo', 'logica_negocio'],
  SMARTFORM: ['nome_programa', 'objetivo'],
  ADOBE_FORM: ['nome_programa', 'objetivo'],
  SAPSCRIPT: ['nome_programa', 'objetivo'],
  DIALOG_PROGRAM: ['nome_programa', 'objetivo', 'logica_negocio'],
  MODULE_POOL: ['nome_programa', 'objetivo', 'logica_negocio'],
  BDC: ['nome_programa', 'objetivo', 'tabelas'],
  LSMW: ['nome_programa', 'objetivo', 'tabelas'],
  IDOC: ['nome_programa', 'objetivo', 'logica_negocio'],
  WEBSERVICE: ['nome_programa', 'objetivo'],
  ODATA_SERVICE: ['nome_programa', 'objetivo', 'tabelas'],
  RAP: ['nome_programa', 'objetivo', 'tabelas'],
  FIORI_ELEMENTS: ['nome_programa', 'objetivo', 'tabelas'],
  INCLUDE: ['nome_programa', 'objetivo'],
  SUBROUTINE: ['nome_programa', 'objetivo'],
  TYPE_POOL: ['nome_programa', 'objetivo'],
  OTHERS: ['nome_programa', 'objetivo'],
}

export function getTipoProgramaLabel(tipo: TipoProgramaABAP): string {
  const found = TIPOS_PROGRAMA_ABAP.find(t => t.value === tipo)
  return found?.label || tipo
}

export function getTipoProgramaCategoria(tipo: TipoProgramaABAP): string {
  const found = TIPOS_PROGRAMA_ABAP.find(t => t.value === tipo)
  return found?.categoria || 'others'
}
