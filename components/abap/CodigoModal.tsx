"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileCode, X } from "lucide-react"
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-3 text-2xl mb-2">
                <FileCode className="h-6 w-6 text-geo-primary" />
                {programa.nome_programa}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  {getTipoProgramaLabel(programa.tipo_programa)}
                </Badge>
                <Badge
                  className={`text-xs border ${getStatusColor(programa.status)}`}
                >
                  {programa.status}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Programa */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            {programa.descricao && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-1">Descrição</h4>
                <p className="text-gray-900">{programa.descricao}</p>
              </div>
            )}

            {programa.objetivo && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-1">Objetivo</h4>
                <p className="text-gray-900">{programa.objetivo}</p>
              </div>
            )}

            {programa.logica_negocio && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                  Lógica de Negócio
                </h4>
                <p className="text-gray-900 whitespace-pre-wrap">{programa.logica_negocio}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-1">Criado em</h4>
              <p className="text-gray-900">{formatDate(programa.criado_em)}</p>
            </div>

            {programa.atualizado_em !== programa.criado_em && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                  Última atualização
                </h4>
                <p className="text-gray-900">{formatDate(programa.atualizado_em)}</p>
              </div>
            )}
          </div>

          {/* Recursos Técnicos */}
          {((programa.tabelas && programa.tabelas.length > 0) ||
            (programa.funcoes && programa.funcoes.length > 0)) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recursos Técnicos</h3>

              {programa.tabelas && programa.tabelas.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    Tabelas Utilizadas ({programa.tabelas.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {programa.tabelas.map((tabela: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-medium text-gray-900">
                              {tabela.nome_tabela}
                            </span>
                            {tabela.tipo && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {tabela.tipo}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {tabela.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{tabela.descricao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {programa.funcoes && programa.funcoes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    Funções/Módulos ({programa.funcoes.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {programa.funcoes.map((funcao: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-medium text-gray-900">{funcao.nome}</span>
                            {funcao.tipo && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {funcao.tipo}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {funcao.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{funcao.descricao}</p>
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Código Gerado</h3>
              <CodigoGeradoViewer codigo={programa.codigo_gerado} />
            </div>
          )}

          {!programa.codigo_gerado && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">
                Este programa ainda não possui código gerado.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
