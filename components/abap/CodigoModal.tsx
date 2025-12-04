"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileCode, X, Calendar, Clock } from "lucide-react"
import { getTipoProgramaLabel } from "@/types/abap"
import { CodigoGeradoViewer } from "./CodigoGeradoViewer"

interface CodigoModalProps {
  programa: any
  open: boolean
  onClose: () => void
}

export function CodigoModal({ programa, open, onClose }: CodigoModalProps) {
  if (!programa) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    <Dialog open={open} onOpenChange={onClose}>
      {/* AQUI FOI ADICIONADO O ! PARA FORÇAR A LARGURA E ALTURA */}
      <DialogContent className="!max-w-[95vw] !w-[95vw] !max-h-[95vh] !h-[95vh] p-0 gap-0 flex flex-col">
        {/* Header fixo com gradiente moderno */}
        <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-geo-primary/5 to-purple-50 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-geo-primary/10 rounded-lg">
              <FileCode className="h-7 w-7 text-geo-primary" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold">{programa.nome_programa}</div>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Visualizador de código ABAP gerado por IA
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-sm px-3 py-1"
              >
                {getTipoProgramaLabel(programa.tipo_programa)}
              </Badge>
              <Badge
                className={`text-sm border px-3 py-1 ${getStatusColor(programa.status)}`}
              >
                {programa.status}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Área de conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Informações do Programa */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-white rounded-lg">
                  <span className="text-2xl">📋</span>
                </div>
                Informações do Programa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programa.descricao && (
                  <div className="bg-white rounded-xl p-5 border-2 border-gray-200 md:col-span-2">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                      <span className="text-blue-500">📝</span>
                      Descrição
                    </h4>
                    <p className="text-gray-900 leading-relaxed">{programa.descricao}</p>
                  </div>
                )}

                {programa.objetivo && (
                  <div className="bg-white rounded-xl p-5 border-2 border-gray-200 md:col-span-2">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                      <span className="text-purple-500">🎯</span>
                      Objetivo
                    </h4>
                    <p className="text-gray-900 leading-relaxed">{programa.objetivo}</p>
                  </div>
                )}

                {programa.logica_negocio && (
                  <div className="bg-white rounded-xl p-5 border-2 border-gray-200 md:col-span-2">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                      <span className="text-red-500">⚙️</span>
                      Lógica de Negócio
                    </h4>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{programa.logica_negocio}</p>
                  </div>
                )}

                <div className="bg-white rounded-xl p-5 border-2 border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    Criado em
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(programa.criado_em)}</p>
                </div>

                {programa.atualizado_em !== programa.criado_em && (
                  <div className="bg-white rounded-xl p-5 border-2 border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Última atualização
                    </h4>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(programa.atualizado_em)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recursos Técnicos */}
            {((programa.tabelas && programa.tabelas.length > 0) ||
              (programa.funcoes && programa.funcoes.length > 0)) && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">🔧</span>
                  </div>
                  Recursos Técnicos
                </h3>

                {programa.tabelas && programa.tabelas.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-300">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-xl">📊</span>
                      </div>
                      Tabelas Utilizadas ({programa.tabelas.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {programa.tabelas.map((tabela: any, i: number) => (
                        <div
                          key={i}
                          className="p-5 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-colors shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-bold text-lg text-blue-700">
                              {tabela.nome_tabela}
                            </span>
                            {tabela.tipo && (
                              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 border-blue-300">
                                {tabela.tipo}
                              </Badge>
                            )}
                          </div>
                          {tabela.descricao && (
                            <p className="text-sm text-gray-700 leading-relaxed">{tabela.descricao}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {programa.funcoes && programa.funcoes.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border-2 border-purple-300">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <span className="text-xl">⚙️</span>
                      </div>
                      Funções/Módulos ({programa.funcoes.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {programa.funcoes.map((funcao: any, i: number) => (
                        <div
                          key={i}
                          className="p-5 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-colors shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-bold text-lg text-purple-700">{funcao.nome}</span>
                            {funcao.tipo && (
                              <Badge variant="outline" className="ml-2 text-xs bg-purple-50 border-purple-300">
                                {funcao.tipo}
                              </Badge>
                            )}
                          </div>
                          {funcao.descricao && (
                            <p className="text-sm text-gray-700 leading-relaxed">{funcao.descricao}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Código Gerado */}
            {programa.codigo_gerado && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💻</span>
                  </div>
                  Código Gerado
                </h3>
                <CodigoGeradoViewer codigo={programa.codigo_gerado} />
              </div>
            )}

            {!programa.codigo_gerado && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-8 text-center">
                <div className="p-4 bg-yellow-100 rounded-full w-fit mx-auto mb-4">
                  <span className="text-4xl">⚠️</span>
                </div>
                <p className="text-lg font-semibold text-yellow-800">
                  Este programa ainda não possui código gerado.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer fixo */}
        <div className="px-8 py-5 border-t bg-gray-50/50 shrink-0">
          <div className="max-w-7xl mx-auto flex justify-end">
            <Button onClick={onClose} size="lg" className="bg-geo-primary hover:bg-geo-primary/90">
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
