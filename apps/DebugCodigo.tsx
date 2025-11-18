"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import {
  Bug,
  AlertCircle,
  FileCode,
  Network,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  BookOpen,
} from "lucide-react"
import {
  TipoAnaliseDebug,
  AnaliseSMQ2Data,
  AnaliseABAPData,
  AnaliseCenarioData,
  AnaliseDebugListItem,
  AnaliseDebugSalva,
  RespostaDebugIA,
  NotaSAPLink,
  TIPOS_OBJETO_ABAP,
  getCorCriticidade,
  getIconeCriticidade,
  getLabelTipoAnalise,
  isTransacaoCustomizada,
} from "@/types/debug"

// Função para buscar notas SAP via microserviço
async function buscarNotasSAP(nomeErro: string): Promise<NotaSAPLink[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SAP_NOTES_API_URL
    const token = process.env.NEXT_PUBLIC_SAP_NOTES_API_TOKEN

    if (!baseUrl || !token) {
      console.warn("API de notas SAP não configurada (variáveis de ambiente ausentes)")
      return []
    }

    const response = await fetch(`${baseUrl}/buscar-notas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome_fila: null,
        nome_erro: nomeErro,
      }),
    })

    if (!response.ok) {
      console.error("Erro ao buscar notas SAP:", response.status)
      return []
    }

    const data = await response.json()

    // Adaptar estrutura da resposta para NotaSAPLink[]
    if (data && Array.isArray(data.links)) {
      return data.links.map((link: any) => ({
        titulo: link.titulo || link.title || "Nota SAP",
        link: link.link || link.url,
        fonte: link.fonte || link.source,
      }))
    }

    return []
  } catch (error) {
    console.error("Erro ao buscar notas SAP:", error)
    return []
  }
}

// Modal wrapper component
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "default",
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "default" | "large" | "xlarge"
}) {
  if (!isOpen) return null

  const sizeClasses = {
    default: "max-w-2xl",
    large: "max-w-4xl",
    xlarge: "max-w-6xl",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </motion.div>
    </div>
  )
}

export function DebugCodigo() {
  // States para dados
  const [analises, setAnalises] = useState<AnaliseDebugListItem[]>([])
  const [stats, setStats] = useState({
    total: 0,
    smq2: 0,
    abap: 0,
    cenario: 0,
    resolvidos: 0,
  })
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // States para modais
  const [modalSMQ2, setModalSMQ2] = useState(false)
  const [modalABAP, setModalABAP] = useState(false)
  const [modalCenario, setModalCenario] = useState(false)
  const [modalDetalhes, setModalDetalhes] = useState(false)
  const [analiseDetalhes, setAnaliseDetalhes] = useState<AnaliseDebugSalva | null>(null)

  // States para formulários SMQ2
  const [formSMQ2, setFormSMQ2] = useState<Omit<AnaliseSMQ2Data, "tipo">>({
    nome_funcao: "",
    nome_fila: "",
    detalhes_ocorrencia: "",
    quando_aconteceu: "",
    dados_adicionais: "",
  })

  // States para formulário ABAP
  const [formABAP, setFormABAP] = useState<Omit<AnaliseABAPData, "tipo">>({
    nome_programa: "",
    tipo_objeto: "REPORT",
    descricao_problema: "",
    codigo_abap: "",
    mensagem_erro: "",
    dump: "",
  })

  // States para formulário Cenário
  const [formCenario, setFormCenario] = useState<Omit<AnaliseCenarioData, "tipo">>({
    transacao: "",
    descricao_cenario: "",
    descricao_problema: "",
    mensagem_erro: "",
    programa_customizado: "",
    passos_reproducao: "",
    dados_entrada: "",
  })

  // Carrega análises ao montar o componente
  useEffect(() => {
    carregarAnalises()
  }, [])

  // Função para carregar análises
  const carregarAnalises = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug/analises?limit=20")
      const data = await response.json()

      if (data.success && data.data) {
        setAnalises(data.data)
        calcularStats(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar análises:", error)
      toast.error("Erro ao carregar análises")
    } finally {
      setLoading(false)
    }
  }

  // Calcula estatísticas
  const calcularStats = (analisesLista: AnaliseDebugListItem[]) => {
    const statsCalculadas = {
      total: analisesLista.length,
      smq2: analisesLista.filter((a) => a.tipo_analise === "SMQ2").length,
      abap: analisesLista.filter((a) => a.tipo_analise === "ABAP").length,
      cenario: analisesLista.filter((a) => a.tipo_analise === "CENARIO").length,
      resolvidos: analisesLista.filter((a) => a.status === "resolvido").length,
    }
    setStats(statsCalculadas)
  }

  // Função genérica para analisar
  const analisarDebug = async (tipo: TipoAnaliseDebug, dados: any) => {
    try {
      setAnalyzing(true)

      // Chama API de análise
      const responseAnalise = await fetch("/api/debug/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dados: { tipo, ...dados } }),
      })

      const dataAnalise = await responseAnalise.json()

      if (!dataAnalise.success) {
        toast.error(dataAnalise.error || "Erro ao analisar")
        return
      }

      const respostaIA: RespostaDebugIA = dataAnalise.data

      // Buscar notas SAP baseado no tipo de análise
      let notasSAP: NotaSAPLink[] = []
      if (tipo === "SMQ2" && dados.nome_fila) {
        // Para SMQ2, usar o campo nome_fila que agora contém o "Erro descritivo"
        notasSAP = await buscarNotasSAP(dados.nome_fila)
      } else if (tipo === "CENARIO" && dados.mensagem_erro) {
        // Para CENARIO, usar o campo mensagem_erro
        notasSAP = await buscarNotasSAP(dados.mensagem_erro)
      }

      // Adicionar links das notas SAP na resposta da IA
      if (notasSAP.length > 0) {
        if (!respostaIA.recursos_adicionais) {
          respostaIA.recursos_adicionais = {}
        }
        respostaIA.recursos_adicionais.notas_sap_links = notasSAP
      }

      // Salva no banco
      const responseSalvar = await fetch("/api/debug/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dados_entrada: { tipo, ...dados },
          resposta_ia: respostaIA,
          status: "analisado",
        }),
      })

      const dataSalvar = await responseSalvar.json()

      if (!dataSalvar.success) {
        toast.error("Análise concluída mas não foi possível salvar")
        return
      }

      toast.success("Análise concluída com sucesso!")

      // Recarrega lista
      await carregarAnalises()

      // Abre modal de detalhes
      await visualizarDetalhes(dataSalvar.data.id)

      // Fecha modal de formulário
      setModalSMQ2(false)
      setModalABAP(false)
      setModalCenario(false)

      // Limpa formulários
      resetarFormularios()
    } catch (error) {
      console.error("Erro ao analisar:", error)
      toast.error("Erro ao processar análise")
    } finally {
      setAnalyzing(false)
    }
  }

  // Handlers de submit para cada tipo
  const handleSubmitSMQ2 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSMQ2.nome_funcao || !formSMQ2.nome_fila || !formSMQ2.detalhes_ocorrencia) {
      toast.error("Preencha os campos obrigatórios")
      return
    }
    await analisarDebug("SMQ2", formSMQ2)
  }

  const handleSubmitABAP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formABAP.nome_programa || !formABAP.descricao_problema || !formABAP.codigo_abap) {
      toast.error("Preencha os campos obrigatórios")
      return
    }
    await analisarDebug("ABAP", formABAP)
  }

  const handleSubmitCenario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formCenario.transacao ||
      !formCenario.descricao_cenario ||
      !formCenario.descricao_problema
    ) {
      toast.error("Preencha os campos obrigatórios")
      return
    }
    await analisarDebug("CENARIO", formCenario)
  }

  // Visualizar detalhes de uma análise
  const visualizarDetalhes = async (id: string) => {
    try {
      const response = await fetch("/api/debug/analises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setAnaliseDetalhes(data.data)
        setModalDetalhes(true)
      } else {
        toast.error("Erro ao carregar detalhes")
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error)
      toast.error("Erro ao carregar detalhes")
    }
  }

  // Atualizar status
  const atualizarStatus = async (id: string, novoStatus: "analisado" | "resolvido" | "pendente") => {
    try {
      const response = await fetch("/api/debug/analises", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: novoStatus }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Status atualizado!")
        await carregarAnalises()

        // Atualiza modal de detalhes se estiver aberto
        if (analiseDetalhes?.id === id) {
          setAnaliseDetalhes({ ...analiseDetalhes, status: novoStatus })
        }
      } else {
        toast.error("Erro ao atualizar status")
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast.error("Erro ao atualizar status")
    }
  }

  // Resetar formulários
  const resetarFormularios = () => {
    setFormSMQ2({
      nome_funcao: "",
      nome_fila: "",
      detalhes_ocorrencia: "",
      quando_aconteceu: "",
      dados_adicionais: "",
    })
    setFormABAP({
      nome_programa: "",
      tipo_objeto: "REPORT",
      descricao_problema: "",
      codigo_abap: "",
      mensagem_erro: "",
      dump: "",
    })
    setFormCenario({
      transacao: "",
      descricao_cenario: "",
      descricao_problema: "",
      mensagem_erro: "",
      programa_customizado: "",
      passos_reproducao: "",
      dados_entrada: "",
    })
  }

  // Formato de data
  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug SAP</h1>
          <p className="text-gray-600">
            Análise inteligente de problemas SAP com IA
          </p>
        </div>
        <Button
          onClick={carregarAnalises}
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Bug className="text-blue-500" size={32} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">SMQ2</p>
              <p className="text-3xl font-bold text-gray-900">{stats.smq2}</p>
            </div>
            <Network className="text-purple-500" size={32} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">ABAP</p>
              <p className="text-3xl font-bold text-gray-900">{stats.abap}</p>
            </div>
            <FileCode className="text-green-500" size={32} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cenários</p>
              <p className="text-3xl font-bold text-gray-900">{stats.cenario}</p>
            </div>
            <AlertCircle className="text-orange-500" size={32} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Resolvidos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.resolvidos}</p>
            </div>
            <CheckCircle2 className="text-emerald-500" size={32} />
          </div>
        </Card>
      </div>

      {/* Seção de Opções de Análise */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nova Análise</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card SMQ2 */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-300 bg-gradient-to-br from-purple-50 to-white"
            onClick={() => setModalSMQ2(true)}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Network className="text-purple-600" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Análise de Fila SMQ2
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Diagnostique problemas em filas qRFC (SMQ2) com análise detalhada
                  de causas e soluções
                </p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  Iniciar análise <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Card>

          {/* Card ABAP */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-green-300 bg-gradient-to-br from-green-50 to-white"
            onClick={() => setModalABAP(true)}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FileCode className="text-green-600" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Análise de Código ABAP
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Debug e correção de código ABAP com identificação de erros e
                  otimizações
                </p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  Iniciar análise <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Card>

          {/* Card Cenário */}
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-300 bg-gradient-to-br from-orange-50 to-white"
            onClick={() => setModalCenario(true)}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertCircle className="text-orange-600" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Análise de Cenário
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Resolva problemas específicos em transações SAP com análise
                  contextual
                </p>
                <div className="flex items-center text-orange-600 text-sm font-medium">
                  Iniciar análise <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Últimas Análises */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Análises Recentes
        </h2>
        <Card className="bg-white border border-gray-200">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          ) : analises.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bug size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Nenhuma análise realizada ainda</p>
              <p className="text-sm mt-1">
                Clique em uma das opções acima para começar
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {analises.map((analise, index) => (
                <motion.div
                  key={analise.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => visualizarDetalhes(analise.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                          {getLabelTipoAnalise(analise.tipo_analise)}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded border ${getCorCriticidade(analise.nivel_criticidade)}`}
                        >
                          {getIconeCriticidade(analise.nivel_criticidade)}{" "}
                          {analise.nivel_criticidade}
                        </span>
                        {analise.status === "resolvido" && (
                          <CheckCircle2 size={16} className="text-green-500" />
                        )}
                        {analise.status === "pendente" && (
                          <Clock size={16} className="text-orange-500" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {analise.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {analise.resumo}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatarData(analise.criado_em)}
                      </p>
                    </div>
                    <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal SMQ2 */}
      <Modal
        isOpen={modalSMQ2}
        onClose={() => setModalSMQ2(false)}
        title="Análise de Fila SMQ2"
        size="large"
      >
        <form onSubmit={handleSubmitSMQ2} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Função/FM <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formSMQ2.nome_funcao}
              onChange={(e) =>
                setFormSMQ2({ ...formSMQ2, nome_funcao: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Z_RFC_UPDATE_MATERIAL"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Erro Descritivo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formSMQ2.nome_fila}
              onChange={(e) =>
                setFormSMQ2({ ...formSMQ2, nome_fila: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Erro ao processar RFC - Timeout na conexão"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quando Aconteceu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formSMQ2.quando_aconteceu}
              onChange={(e) =>
                setFormSMQ2({ ...formSMQ2, quando_aconteceu: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Durante integração de materiais hoje às 14h"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detalhes da Ocorrência <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formSMQ2.detalhes_ocorrencia}
              onChange={(e) =>
                setFormSMQ2({ ...formSMQ2, detalhes_ocorrencia: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px]"
              placeholder="Descreva o erro: mensagens, sintomas, quantas filas afetadas, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dados Adicionais (Opcional)
            </label>
            <textarea
              value={formSMQ2.dados_adicionais}
              onChange={(e) =>
                setFormSMQ2({ ...formSMQ2, dados_adicionais: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px]"
              placeholder="Informações extras: logs, dumps, tentativas anteriores, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalSMQ2(false)}
              disabled={analyzing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={analyzing}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Analisando...
                </>
              ) : (
                <>Analisar</>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal ABAP */}
      <Modal
        isOpen={modalABAP}
        onClose={() => setModalABAP(false)}
        title="Análise de Código ABAP"
        size="xlarge"
      >
        <form onSubmit={handleSubmitABAP} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Programa/Objeto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formABAP.nome_programa}
                onChange={(e) =>
                  setFormABAP({ ...formABAP, nome_programa: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Z_PROGRAMA_TESTE"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Objeto <span className="text-red-500">*</span>
              </label>
              <select
                value={formABAP.tipo_objeto}
                onChange={(e) =>
                  setFormABAP({
                    ...formABAP,
                    tipo_objeto: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                {TIPOS_OBJETO_ABAP.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Problema <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formABAP.descricao_problema}
              onChange={(e) =>
                setFormABAP({ ...formABAP, descricao_problema: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[80px]"
              placeholder="Descreva o problema que está enfrentando"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código ABAP <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formABAP.codigo_abap}
              onChange={(e) =>
                setFormABAP({ ...formABAP, codigo_abap: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[200px] font-mono text-sm"
              placeholder="Cole o código ABAP aqui..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem de Erro (Opcional)
            </label>
            <textarea
              value={formABAP.mensagem_erro}
              onChange={(e) =>
                setFormABAP({ ...formABAP, mensagem_erro: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[60px] font-mono text-sm"
              placeholder="Cole a mensagem de erro se houver"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DUMP/Short Dump (Opcional)
            </label>
            <textarea
              value={formABAP.dump}
              onChange={(e) => setFormABAP({ ...formABAP, dump: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px] font-mono text-sm"
              placeholder="Cole o dump completo se disponível"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalABAP(false)}
              disabled={analyzing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={analyzing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Analisando...
                </>
              ) : (
                <>Analisar</>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Cenário */}
      <Modal
        isOpen={modalCenario}
        onClose={() => setModalCenario(false)}
        title="Análise de Cenário Específico"
        size="large"
      >
        <form onSubmit={handleSubmitCenario} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transação SAP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formCenario.transacao}
              onChange={(e) =>
                setFormCenario({ ...formCenario, transacao: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ex: VA01, MM01, ZMM_CUSTOM"
              required
            />
            {formCenario.transacao && isTransacaoCustomizada(formCenario.transacao) && (
              <p className="text-xs text-orange-600 mt-1">
                Transação customizada detectada (Z/Y)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Cenário <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formCenario.descricao_cenario}
              onChange={(e) =>
                setFormCenario({ ...formCenario, descricao_cenario: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[80px]"
              placeholder="Descreva o cenário de negócio / processo que está executando"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Problema <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formCenario.descricao_problema}
              onChange={(e) =>
                setFormCenario({
                  ...formCenario,
                  descricao_problema: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]"
              placeholder="Descreva o problema que está ocorrendo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem de Erro (Opcional)
            </label>
            <textarea
              value={formCenario.mensagem_erro}
              onChange={(e) =>
                setFormCenario({
                  ...formCenario,
                  mensagem_erro: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[80px]"
              placeholder="Ex: RFC_ERROR_SYSTEM_FAILURE - Timeout ao conectar com sistema remoto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passos para Reproduzir (Opcional)
            </label>
            <textarea
              value={formCenario.passos_reproducao}
              onChange={(e) =>
                setFormCenario({
                  ...formCenario,
                  passos_reproducao: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[80px]"
              placeholder="Liste os passos para reproduzir o problema"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dados de Entrada (Opcional)
            </label>
            <textarea
              value={formCenario.dados_entrada}
              onChange={(e) =>
                setFormCenario({ ...formCenario, dados_entrada: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[60px]"
              placeholder="Dados usados no teste: materiais, centros, valores, etc."
            />
          </div>

          {formCenario.transacao && isTransacaoCustomizada(formCenario.transacao) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código do Programa Customizado (Opcional)
              </label>
              <textarea
                value={formCenario.programa_customizado}
                onChange={(e) =>
                  setFormCenario({
                    ...formCenario,
                    programa_customizado: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[150px] font-mono text-sm"
                placeholder="Cole o código ABAP do programa Z/Y se aplicável"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalCenario(false)}
              disabled={analyzing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={analyzing}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Analisando...
                </>
              ) : (
                <>Analisar</>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={modalDetalhes}
        onClose={() => setModalDetalhes(false)}
        title={analiseDetalhes?.titulo || "Detalhes da Análise"}
        size="xlarge"
      >
        {analiseDetalhes && (
          <div className="space-y-6">
            {/* Header com info e ações */}
            <div className="flex items-start justify-between pb-4 border-b">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {getLabelTipoAnalise(analiseDetalhes.tipo_analise)}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded border ${getCorCriticidade(analiseDetalhes.resposta_ia.nivel_criticidade)}`}
                  >
                    {getIconeCriticidade(analiseDetalhes.resposta_ia.nivel_criticidade)}{" "}
                    {analiseDetalhes.resposta_ia.nivel_criticidade}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Criado em {formatarData(analiseDetalhes.criado_em)}
                </p>
                <p className="text-sm text-gray-600">
                  Tempo estimado: {analiseDetalhes.resposta_ia.tempo_estimado}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={analiseDetalhes.status === "pendente" ? "default" : "outline"}
                  onClick={() => atualizarStatus(analiseDetalhes.id, "pendente")}
                  className="flex items-center gap-1"
                >
                  <Clock size={14} />
                  Pendente
                </Button>
                <Button
                  size="sm"
                  variant={analiseDetalhes.status === "analisado" ? "default" : "outline"}
                  onClick={() => atualizarStatus(analiseDetalhes.id, "analisado")}
                  className="flex items-center gap-1"
                >
                  <AlertTriangle size={14} />
                  Analisado
                </Button>
                <Button
                  size="sm"
                  variant={analiseDetalhes.status === "resolvido" ? "default" : "outline"}
                  onClick={() => atualizarStatus(analiseDetalhes.id, "resolvido")}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 size={14} />
                  Resolvido
                </Button>
              </div>
            </div>

            {/* Resumo do Problema */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resumo do Problema
              </h3>
              <p className="text-gray-700">{analiseDetalhes.resposta_ia.resumo_problema}</p>
            </div>

            {/* Causa Raiz */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Causa Raiz</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {analiseDetalhes.resposta_ia.causa_raiz}
                </p>
              </div>
            </div>

            {/* Solução */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Solução</h3>

              {/* Passos */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Passos:</h4>
                <ol className="space-y-2">
                  {analiseDetalhes.resposta_ia.solucao.passos.map((passo, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 flex-1">{passo}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Código de Correção */}
              {analiseDetalhes.resposta_ia.solucao.codigo_correcao && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Código de Correção:</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {analiseDetalhes.resposta_ia.solucao.codigo_correcao}
                  </pre>
                </div>
              )}

              {/* Configurações */}
              {analiseDetalhes.resposta_ia.solucao.configuracoes &&
                analiseDetalhes.resposta_ia.solucao.configuracoes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Configurações:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {analiseDetalhes.resposta_ia.solucao.configuracoes.map(
                        (config, idx) => (
                          <li key={idx}>{config}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* Observações */}
              {analiseDetalhes.resposta_ia.solucao.observacoes &&
                analiseDetalhes.resposta_ia.solucao.observacoes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Observações:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {analiseDetalhes.resposta_ia.solucao.observacoes.map((obs, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span>•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Prevenção */}
            {analiseDetalhes.resposta_ia.prevencao &&
              analiseDetalhes.resposta_ia.prevencao.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Prevenção
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {analiseDetalhes.resposta_ia.prevencao.map((prev, idx) => (
                        <li key={idx} className="flex gap-2 text-gray-700">
                          <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{prev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            {/* Links de Notas SAP */}
            {analiseDetalhes.resposta_ia.recursos_adicionais?.notas_sap_links &&
              analiseDetalhes.resposta_ia.recursos_adicionais.notas_sap_links.length >
                0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-600" />
                    Notas SAP Encontradas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analiseDetalhes.resposta_ia.recursos_adicionais.notas_sap_links.map(
                      (nota, idx) => (
                        <Card
                          key={idx}
                          className="p-4 hover:shadow-lg transition-shadow border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white"
                        >
                          <a
                            href={nota.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 group"
                          >
                            <ExternalLink
                              size={20}
                              className="text-blue-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                                {nota.titulo}
                              </h4>
                              {nota.fonte && (
                                <p className="text-xs text-gray-500">
                                  Fonte: {nota.fonte}
                                </p>
                              )}
                            </div>
                          </a>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Recursos Adicionais */}
            {analiseDetalhes.resposta_ia.recursos_adicionais && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Recursos Adicionais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Notas SAP */}
                  {analiseDetalhes.resposta_ia.recursos_adicionais.notas_sap &&
                    analiseDetalhes.resposta_ia.recursos_adicionais.notas_sap.length >
                      0 && (
                      <Card className="p-4">
                        <h4 className="font-medium text-gray-800 mb-2 text-sm">
                          Notas SAP
                        </h4>
                        <ul className="space-y-1 text-xs text-gray-600">
                          {analiseDetalhes.resposta_ia.recursos_adicionais.notas_sap.map(
                            (nota, idx) => (
                              <li key={idx}>• {nota}</li>
                            )
                          )}
                        </ul>
                      </Card>
                    )}

                  {/* Transações Úteis */}
                  {analiseDetalhes.resposta_ia.recursos_adicionais
                    .transacoes_uteis &&
                    analiseDetalhes.resposta_ia.recursos_adicionais.transacoes_uteis
                      .length > 0 && (
                      <Card className="p-4">
                        <h4 className="font-medium text-gray-800 mb-2 text-sm">
                          Transações Úteis
                        </h4>
                        <ul className="space-y-1 text-xs text-gray-600">
                          {analiseDetalhes.resposta_ia.recursos_adicionais.transacoes_uteis.map(
                            (tran, idx) => (
                              <li key={idx}>• {tran}</li>
                            )
                          )}
                        </ul>
                      </Card>
                    )}

                  {/* Documentação */}
                  {analiseDetalhes.resposta_ia.recursos_adicionais.documentacao &&
                    analiseDetalhes.resposta_ia.recursos_adicionais.documentacao
                      .length > 0 && (
                      <Card className="p-4">
                        <h4 className="font-medium text-gray-800 mb-2 text-sm">
                          Documentação
                        </h4>
                        <ul className="space-y-1 text-xs text-gray-600">
                          {analiseDetalhes.resposta_ia.recursos_adicionais.documentacao.map(
                            (doc, idx) => (
                              <li key={idx}>• {doc}</li>
                            )
                          )}
                        </ul>
                      </Card>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
