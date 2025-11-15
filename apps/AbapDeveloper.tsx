"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import {
  Code2,
  Sparkles,
  TrendingUp,
  FileCode,
  Clock,
  Eye,
  Download,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { AbapStats, ProgramaABAPListItem, getTipoProgramaLabel } from "@/types/abap"
import { AbapModal } from "@/components/abap/AbapModal"
import { CodigoModal } from "@/components/abap/CodigoModal"

export function AbapDeveloper() {
  const [stats, setStats] = useState<AbapStats | null>(null)
  const [programasRecentes, setProgramasRecentes] = useState<ProgramaABAPListItem[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingProgramas, setIsLoadingProgramas] = useState(true)

  // Modais
  const [isAbapModalOpen, setIsAbapModalOpen] = useState(false)
  const [isFioriModalOpen, setIsFioriModalOpen] = useState(false)
  const [codigoSelecionado, setCodigoSelecionado] = useState<ProgramaABAPListItem | null>(null)

  // Carrega estatísticas
  useEffect(() => {
    carregarStats()
    carregarProgramasRecentes()
  }, [])

  const carregarStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch("/api/abap/stats")

      if (!response.ok) {
        throw new Error("Erro ao carregar estatísticas")
      }

      const data = await response.json()
      setStats(data)
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas:", error)
      toast.error("Erro ao carregar estatísticas")
    } finally {
      setIsLoadingStats(false)
    }
  }

  const carregarProgramasRecentes = async () => {
    try {
      setIsLoadingProgramas(true)
      const response = await fetch("/api/abap/programas?limit=6&status=gerado,refinado")

      if (!response.ok) {
        throw new Error("Erro ao carregar programas")
      }

      const data = await response.json()
      console.log("Programas recentes carregados:", {
        total: data.total,
        retornados: data.programas?.length || 0,
        programas: data.programas,
      })
      setProgramasRecentes(data.programas || [])
    } catch (error: any) {
      console.error("Erro ao carregar programas:", error)
      toast.error("Erro ao carregar programas")
    } finally {
      setIsLoadingProgramas(false)
    }
  }

  const handleProgramaGerado = () => {
    // Recarrega stats e programas após gerar novo programa
    carregarStats()
    carregarProgramasRecentes()
  }

  const handleVisualizarCodigo = async (programa: ProgramaABAPListItem) => {
    try {
      const response = await fetch("/api/abap/programas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: programa.id }),
      })

      if (!response.ok) {
        throw new Error("Erro ao carregar programa")
      }

      const programaCompleto = await response.json()
      setCodigoSelecionado(programaCompleto)
    } catch (error: any) {
      console.error("Erro ao carregar programa:", error)
      toast.error("Erro ao carregar código do programa")
    }
  }

  const handleDeletarPrograma = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente deletar o programa ${nome}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/abap/programas?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar programa")
      }

      toast.success("Programa deletado com sucesso!")
      carregarProgramasRecentes()
      carregarStats()
    } catch (error: any) {
      console.error("Erro ao deletar programa:", error)
      toast.error("Erro ao deletar programa")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "gerado":
        return "bg-green-100 text-green-800 border-green-200"
      case "refinado":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "rascunho":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ABAP Developer AI
          </h1>
          <p className="text-gray-600">
            Gere código ABAP de alta qualidade usando Inteligência Artificial
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Programas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingStats ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    stats?.total_programas || 0
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-geo-primary/10 flex items-center justify-center">
                <FileCode className="h-6 w-6 text-geo-primary" />
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Programas Gerados</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingStats ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    stats?.programas_gerados || 0
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Refinados</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingStats ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    stats?.programas_refinados || 0
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Últimos 7 dias</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingStats ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    stats?.programas_recentes || 0
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Botões de Ação */}
        <Card className="bg-gradient-to-r from-geo-primary to-geo-secondary border-0 shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">
                Pronto para gerar código ABAP?
              </h2>
              <p className="text-white/90">
                Escolha entre gerar código ABAP ou criar aplicações Fiori
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setIsAbapModalOpen(true)}
                size="lg"
                className="bg-white text-geo-primary hover:bg-gray-100 shadow-md flex items-center gap-2 px-8 py-6 text-lg font-semibold"
              >
                <Code2 className="h-6 w-6" />
                Gerar Código ABAP
              </Button>
              <Button
                onClick={() => setIsFioriModalOpen(true)}
                size="lg"
                variant="outline"
                className="bg-white text-geo-primary hover:bg-gray-100 shadow-md flex items-center gap-2 px-8 py-6 text-lg font-semibold"
              >
                <Sparkles className="h-6 w-6" />
                Gerar Fiori
              </Button>
            </div>
          </div>
        </Card>

        {/* Programas Recentes */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Programas Recentes
          </h2>

          {isLoadingProgramas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-geo-primary" />
            </div>
          ) : programasRecentes.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-sm p-12">
              <div className="text-center text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Nenhum programa gerado ainda</p>
                <p className="text-sm mt-2">
                  Clique em "Gerar Código ABAP" para começar
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {programasRecentes.map((programa) => (
                  <motion.div
                    key={programa.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 truncate mb-1">
                            {programa.nome_programa}
                          </h3>
                          <Badge
                            className={`text-xs border ${getStatusColor(
                              programa.status
                            )}`}
                          >
                            {programa.status}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          {getTipoProgramaLabel(programa.tipo_programa)}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-2">
                        {programa.descricao || "Sem descrição"}
                      </p>

                      <div className="text-xs text-gray-500 mb-4">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDate(programa.criado_em)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleVisualizarCodigo(programa)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Visualizar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            handleDeletarPrograma(programa.id, programa.nome_programa)
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal de Criação ABAP */}
      <AbapModal
        open={isAbapModalOpen}
        onClose={() => setIsAbapModalOpen(false)}
        onProgramaGerado={handleProgramaGerado}
      />

      {/* Modal de Fiori (Em Desenvolvimento) */}
      <Dialog open={isFioriModalOpen} onOpenChange={setIsFioriModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-geo-primary" />
              Gerador de Aplicações Fiori
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm font-medium mb-2">
                  🚧 Funcionalidade em Desenvolvimento
                </p>
                <p className="text-yellow-700 text-sm">
                  A geração de aplicações Fiori está sendo implementada e estará
                  disponível em breve. Aguarde as próximas atualizações!
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Recursos planejados:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Geração de Fiori Elements Apps</li>
                  <li>Criação de CDS Views e OData Services</li>
                  <li>Templates de UI5 personalizados</li>
                  <li>Integração com SAP Cloud Platform</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              onClick={() => setIsFioriModalOpen(false)}
              className="w-full bg-geo-primary hover:bg-geo-primary/90"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Código */}
      {codigoSelecionado && (
        <CodigoModal
          programa={codigoSelecionado}
          open={!!codigoSelecionado}
          onClose={() => setCodigoSelecionado(null)}
        />
      )}
    </>
  )
}
