"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Loader2,
  FileText,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import {
  EFFormData,
  MembroEquipe,
  TabelaSAP,
  ModuloSAP,
  MODULOS_SAP,
  TIPOS_PROGRAMA,
  TIPOS_TABELA,
  TIPOS_MODULO,
  CARGOS_EQUIPE,
  EFRefinada,
} from "@/types/ef"

interface EFModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EFModal({ open, onClose, onSuccess }: EFModalProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [efRefinada, setEfRefinada] = useState<EFRefinada | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState<EFFormData>({
    titulo: "",
    versao: "1.0",
    autor: user?.profile?.nome || user?.email || "",
    descricao: "",
    modulo_sap: "",
    data_criacao: new Date().toISOString().split("T")[0],
    empresa: "",
    tipo_programa: "",
    consultor_nome: user?.profile?.nome || user?.email || "",
    consultor_cargo: "",
    equipe: [],
    visao_geral: "",
    motivo_ef: "",
    especificacao_detalhada: "",
    tabelas: [],
    modulos: [],
  })

  // Equipe temp
  const [novoMembro, setNovoMembro] = useState<MembroEquipe>({
    nome: "",
    cargo: "",
    email: "",
  })

  // Tabela temp
  const [novaTabela, setNovaTabela] = useState<TabelaSAP>({
    nome_tabela: "",
    descricao: "",
    tipo: "",
  })

  // Módulo temp
  const [novoModulo, setNovoModulo] = useState<ModuloSAP>({
    nome_modulo: "",
    descricao: "",
    tipo: "",
  })

  const totalSteps = 7

  const handleNext = () => {
    // Validação por step
    if (currentStep === 1) {
      if (!formData.titulo || !formData.descricao) {
        toast.error("Preencha o título e a descrição")
        return
      }
    }
    if (currentStep === 2) {
      if (
        !formData.modulo_sap ||
        !formData.empresa ||
        !formData.tipo_programa
      ) {
        toast.error("Preencha todos os campos SAP")
        return
      }
    }
    if (currentStep === 3) {
      if (!formData.consultor_nome || !formData.consultor_cargo) {
        toast.error("Preencha os dados do consultor responsável")
        return
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const adicionarMembro = () => {
    if (!novoMembro.nome || !novoMembro.cargo) {
      toast.error("Preencha nome e cargo")
      return
    }
    setFormData({
      ...formData,
      equipe: [...formData.equipe, novoMembro],
    })
    setNovoMembro({ nome: "", cargo: "", email: "" })
    toast.success("Membro adicionado")
  }

  const removerMembro = (index: number) => {
    setFormData({
      ...formData,
      equipe: formData.equipe.filter((_, i) => i !== index),
    })
  }

  const adicionarTabela = () => {
    if (!novaTabela.nome_tabela || !novaTabela.tipo) {
      toast.error("Preencha nome e tipo da tabela")
      return
    }
    setFormData({
      ...formData,
      tabelas: [...formData.tabelas, novaTabela],
    })
    setNovaTabela({ nome_tabela: "", descricao: "", tipo: "" })
    toast.success("Tabela adicionada")
  }

  const removerTabela = (index: number) => {
    setFormData({
      ...formData,
      tabelas: formData.tabelas.filter((_, i) => i !== index),
    })
  }

  const adicionarModulo = () => {
    if (!novoModulo.nome_modulo || !novoModulo.tipo) {
      toast.error("Preencha nome e tipo do módulo")
      return
    }
    setFormData({
      ...formData,
      modulos: [...formData.modulos, novoModulo],
    })
    setNovoModulo({ nome_modulo: "", descricao: "", tipo: "" })
    toast.success("Módulo adicionado")
  }

  const removerModulo = (index: number) => {
    setFormData({
      ...formData,
      modulos: formData.modulos.filter((_, i) => i !== index),
    })
  }

  const handleGerar = async () => {
    // Validação final
    if (!formData.especificacao_detalhada) {
      toast.error("Preencha a especificação detalhada")
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/ef/refinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.error || "Erro ao refinar EF")
        setIsProcessing(false)
        return
      }

      setEfRefinada(result.data)
      setShowPreview(true)
      toast.success("EF refinada com sucesso!")
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar EF")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSalvarEBaixar = async () => {
    if (!efRefinada) return

    setIsProcessing(true)

    try {
      // Monta payload para a API de geração de DOCX
      const payload = {
        projeto_titulo: efRefinada.informacoes_basicas.titulo,
        autor: efRefinada.informacoes_basicas.autor,
        descricao_breve: efRefinada.informacoes_basicas.descricao,
        modulo_sap: efRefinada.dados_sap.modulo,
        data_criacao: formatarDataParaAPI(efRefinada.informacoes_basicas.data_criacao),
        empresa_cliente: efRefinada.informacoes_basicas.empresa,
        descricao_resumida: efRefinada.informacoes_basicas.descricao_resumida,
        consultor_nome: efRefinada.consultor.nome,
        consultor_cargo: efRefinada.consultor.cargo,
        visao_geral: efRefinada.visao_geral.descricao,
        especificacao_detalhada: montarEspecificacaoDetalhada(efRefinada),
      }

      // Chama API de geração de DOCX
      const apiUrl = process.env.NEXT_PUBLIC_SAP_NOTES_API_URL || "http://m840cwcks40co8c8scc8gg80.195.35.17.111.sslip.io"
      const apiToken = process.env.NEXT_PUBLIC_SAP_NOTES_API_TOKEN

      const responseDocx = await fetch(`${apiUrl}/gerar-ef-docx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (!responseDocx.ok) {
        throw new Error("Erro ao gerar documento DOCX")
      }

      // Recebe o blob do DOCX
      const blob = await responseDocx.blob()

      // Faz download do arquivo
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${efRefinada.informacoes_basicas.titulo.replace(/\s+/g, "_")}_EF.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Documento DOCX gerado com sucesso!")

      // Salva no banco
      const responseSalvar = await fetch("/api/ef/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ef: {
            ...formData,
            conteudo_refinado: efRefinada,
          },
          equipe: formData.equipe,
          tabelas: formData.tabelas,
          modulos: formData.modulos,
        }),
      })

      const resultSalvar = await responseSalvar.json()

      if (resultSalvar.success) {
        toast.success("EF salva no banco de dados!")
      }

      // Fecha modal e atualiza dashboard
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error("Erro ao gerar DOCX:", error)
      toast.error(error.message || "Erro ao gerar documento")
    } finally {
      setIsProcessing(false)
    }
  }

  // Formata data para o padrão esperado pela API (dd/mm/yyyy)
  const formatarDataParaAPI = (dataISO: string): string => {
    const date = new Date(dataISO)
    const dia = String(date.getDate()).padStart(2, "0")
    const mes = String(date.getMonth() + 1).padStart(2, "0")
    const ano = date.getFullYear()
    return `${dia}/${mes}/${ano}`
  }

  // Monta especificação detalhada concatenando todas as seções
  const montarEspecificacaoDetalhada = (ef: EFRefinada): string => {
    let spec = `${ef.especificacao.introducao}\n\n`

    // Processos
    if (ef.especificacao.processos.length > 0) {
      spec += "PROCESSOS:\n\n"
      ef.especificacao.processos.forEach((proc, idx) => {
        spec += `${idx + 1}. ${proc.nome}\n`
        spec += `${proc.descricao}\n`
        spec += "Passos:\n"
        proc.passos.forEach((passo, pIdx) => {
          spec += `  ${pIdx + 1}. ${passo}\n`
        })
        spec += "\n"
      })
    }

    // Regras de negócio
    if (ef.especificacao.regras_negocio.length > 0) {
      spec += "REGRAS DE NEGÓCIO:\n\n"
      ef.especificacao.regras_negocio.forEach((regra, idx) => {
        spec += `${idx + 1}. ${regra}\n`
      })
      spec += "\n"
    }

    // Considerações técnicas
    if (ef.especificacao.consideracoes_tecnicas.length > 0) {
      spec += "CONSIDERAÇÕES TÉCNICAS:\n\n"
      ef.especificacao.consideracoes_tecnicas.forEach((consideracao, idx) => {
        spec += `${idx + 1}. ${consideracao}\n`
      })
      spec += "\n"
    }

    // Tabelas
    if (ef.recursos_tecnicos.tabelas.length > 0) {
      spec += "TABELAS UTILIZADAS:\n\n"
      ef.recursos_tecnicos.tabelas.forEach((tab) => {
        spec += `- ${tab.nome} (${tab.tipo}): ${tab.descricao}\n`
      })
      spec += "\n"
    }

    // Módulos
    if (ef.recursos_tecnicos.modulos.length > 0) {
      spec += "MÓDULOS/COMPONENTES:\n\n"
      ef.recursos_tecnicos.modulos.forEach((mod) => {
        spec += `- ${mod.nome} (${mod.tipo}): ${mod.descricao}\n`
      })
    }

    return spec
  }

  const handleClose = () => {
    setCurrentStep(1)
    setFormData({
      titulo: "",
      versao: "1.0",
      autor: user?.profile?.nome || user?.email || "",
      descricao: "",
      modulo_sap: "",
      data_criacao: new Date().toISOString().split("T")[0],
      empresa: "",
      tipo_programa: "",
      consultor_nome: user?.profile?.nome || user?.email || "",
      consultor_cargo: "",
      equipe: [],
      visao_geral: "",
      motivo_ef: "",
      especificacao_detalhada: "",
      tabelas: [],
      modulos: [],
    })
    setEfRefinada(null)
    setShowPreview(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {showPreview
              ? "Preview da Especificação Funcional"
              : "Nova Especificação Funcional"}
          </DialogTitle>
        </DialogHeader>

        {!showPreview ? (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Passo {currentStep} de {totalSteps}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-geo-primary h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${(currentStep / totalSteps) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step 1: Informações Básicas */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Informações Básicas
                    </h3>
                    <div>
                      <Label>Título da EF *</Label>
                      <Input
                        value={formData.titulo}
                        onChange={(e) =>
                          setFormData({ ...formData, titulo: e.target.value })
                        }
                        placeholder="Ex: Sistema de Gestão de Pedidos"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Versão</Label>
                        <Input
                          value={formData.versao}
                          onChange={(e) =>
                            setFormData({ ...formData, versao: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Autor</Label>
                        <Input
                          value={formData.autor}
                          onChange={(e) =>
                            setFormData({ ...formData, autor: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Descrição *</Label>
                      <Textarea
                        value={formData.descricao}
                        onChange={(e) =>
                          setFormData({ ...formData, descricao: e.target.value })
                        }
                        placeholder="Descreva brevemente o objetivo desta especificação funcional"
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Dados SAP */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dados SAP
                    </h3>
                    <div>
                      <Label>Módulo SAP *</Label>
                      <Select
                        value={formData.modulo_sap}
                        onValueChange={(value) =>
                          setFormData({ ...formData, modulo_sap: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o módulo" />
                        </SelectTrigger>
                        <SelectContent>
                          {MODULOS_SAP.map((mod) => (
                            <SelectItem key={mod.value} value={mod.value}>
                              {mod.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={formData.data_criacao}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              data_criacao: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Empresa *</Label>
                        <Input
                          value={formData.empresa}
                          onChange={(e) =>
                            setFormData({ ...formData, empresa: e.target.value })
                          }
                          placeholder="Nome da empresa"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Tipo de Programa *</Label>
                      <Select
                        value={formData.tipo_programa}
                        onValueChange={(value) =>
                          setFormData({ ...formData, tipo_programa: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_PROGRAMA.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 3: Consultor e Equipe */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Consultor Responsável
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Consultor *</Label>
                        <Input
                          value={formData.consultor_nome}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              consultor_nome: e.target.value,
                            })
                          }
                          placeholder="Nome do consultor principal"
                        />
                      </div>
                      <div>
                        <Label>Cargo do Consultor *</Label>
                        <Select
                          value={formData.consultor_cargo}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              consultor_cargo: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cargo" />
                          </SelectTrigger>
                          <SelectContent>
                            {CARGOS_EQUIPE.map((cargo) => (
                              <SelectItem key={cargo} value={cargo}>
                                {cargo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                      Equipe do Projeto (Opcional)
                    </h3>
                    <Card className="p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label>Nome</Label>
                          <Input
                            value={novoMembro.nome}
                            onChange={(e) =>
                              setNovoMembro({
                                ...novoMembro,
                                nome: e.target.value,
                              })
                            }
                            placeholder="Nome do membro"
                          />
                        </div>
                        <div>
                          <Label>Cargo</Label>
                          <Select
                            value={novoMembro.cargo}
                            onValueChange={(value) =>
                              setNovoMembro({ ...novoMembro, cargo: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Cargo" />
                            </SelectTrigger>
                            <SelectContent>
                              {CARGOS_EQUIPE.map((cargo) => (
                                <SelectItem key={cargo} value={cargo}>
                                  {cargo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Email (opcional)</Label>
                          <Input
                            type="email"
                            value={novoMembro.email}
                            onChange={(e) =>
                              setNovoMembro({
                                ...novoMembro,
                                email: e.target.value,
                              })
                            }
                            placeholder="email@empresa.com"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={adicionarMembro}
                        className="mt-3 w-full"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Membro
                      </Button>
                    </Card>

                    {/* Lista de Membros */}
                    <div className="space-y-2">
                      {formData.equipe.map((membro, index) => (
                        <Card key={index} className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{membro.nome}</p>
                            <p className="text-sm text-gray-600">{membro.cargo}</p>
                            {membro.email && (
                              <p className="text-xs text-gray-500">{membro.email}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerMembro(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </Card>
                      ))}
                      {formData.equipe.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Nenhum membro adicionado ainda
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Visão Geral */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Visão Geral e Justificativa
                    </h3>
                    <div>
                      <Label>Visão Geral do Processo</Label>
                      <Textarea
                        value={formData.visao_geral}
                        onChange={(e) =>
                          setFormData({ ...formData, visao_geral: e.target.value })
                        }
                        placeholder="Descreva a visão macro do processo que será implementado"
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label>Motivo da EF</Label>
                      <Textarea
                        value={formData.motivo_ef}
                        onChange={(e) =>
                          setFormData({ ...formData, motivo_ef: e.target.value })
                        }
                        placeholder="Explique por que esta EF é necessária e qual problema ela resolve"
                        rows={6}
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Especificação */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Especificação Detalhada
                    </h3>
                    <div>
                      <Label>Especificação Técnica *</Label>
                      <Textarea
                        value={formData.especificacao_detalhada}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            especificacao_detalhada: e.target.value,
                          })
                        }
                        placeholder="Descreva toda a lógica necessária, regras de negócio, fluxos, validações, etc."
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Detalhe toda a lógica que precisa ser implementada. A IA vai
                      organizar e estruturar este conteúdo.
                    </p>
                  </div>
                )}

                {/* Step 6: Tabelas e Módulos */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Tabelas SAP
                      </h3>
                      <Card className="p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>Nome da Tabela</Label>
                            <Input
                              value={novaTabela.nome_tabela}
                              onChange={(e) =>
                                setNovaTabela({
                                  ...novaTabela,
                                  nome_tabela: e.target.value.toUpperCase(),
                                })
                              }
                              placeholder="VBAK"
                            />
                          </div>
                          <div>
                            <Label>Tipo</Label>
                            <Select
                              value={novaTabela.tipo}
                              onValueChange={(value) =>
                                setNovaTabela({ ...novaTabela, tipo: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_TABELA.map((tipo) => (
                                  <SelectItem key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Descrição</Label>
                            <Input
                              value={novaTabela.descricao}
                              onChange={(e) =>
                                setNovaTabela({
                                  ...novaTabela,
                                  descricao: e.target.value,
                                })
                              }
                              placeholder="Cabeçalho de pedidos"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={adicionarTabela}
                          className="mt-3 w-full"
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Tabela
                        </Button>
                      </Card>

                      <div className="space-y-2 mt-4">
                        {formData.tabelas.map((tabela, index) => (
                          <Card
                            key={index}
                            className="p-3 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium font-mono">
                                {tabela.nome_tabela}
                              </p>
                              <p className="text-sm text-gray-600">{tabela.tipo}</p>
                              {tabela.descricao && (
                                <p className="text-xs text-gray-500">
                                  {tabela.descricao}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerTabela(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Módulos/Componentes
                      </h3>
                      <Card className="p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>Nome do Módulo</Label>
                            <Input
                              value={novoModulo.nome_modulo}
                              onChange={(e) =>
                                setNovoModulo({
                                  ...novoModulo,
                                  nome_modulo: e.target.value,
                                })
                              }
                              placeholder="Z_FM_PROCESS_ORDER"
                            />
                          </div>
                          <div>
                            <Label>Tipo</Label>
                            <Select
                              value={novoModulo.tipo}
                              onValueChange={(value) =>
                                setNovoModulo({ ...novoModulo, tipo: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_MODULO.map((tipo) => (
                                  <SelectItem key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Descrição</Label>
                            <Input
                              value={novoModulo.descricao}
                              onChange={(e) =>
                                setNovoModulo({
                                  ...novoModulo,
                                  descricao: e.target.value,
                                })
                              }
                              placeholder="Processa pedidos"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={adicionarModulo}
                          className="mt-3 w-full"
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Módulo
                        </Button>
                      </Card>

                      <div className="space-y-2 mt-4">
                        {formData.modulos.map((modulo, index) => (
                          <Card
                            key={index}
                            className="p-3 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium font-mono">
                                {modulo.nome_modulo}
                              </p>
                              <p className="text-sm text-gray-600">{modulo.tipo}</p>
                              {modulo.descricao && (
                                <p className="text-xs text-gray-500">
                                  {modulo.descricao}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerModulo(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7: Gerar */}
                {currentStep === 7 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pronto para Gerar!
                    </h3>
                    <Card className="p-6 bg-gradient-to-br from-geo-primary/5 to-geo-secondary/5">
                      <div className="flex items-center gap-4 mb-4">
                        <FileText className="w-12 h-12 text-geo-primary" />
                        <div>
                          <h4 className="text-lg font-semibold">
                            {formData.titulo}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formData.modulo_sap} - {formData.tipo_programa}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Equipe</p>
                          <p className="font-semibold">
                            {formData.equipe.length} membros
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tabelas</p>
                          <p className="font-semibold">
                            {formData.tabelas.length} tabelas
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Módulos</p>
                          <p className="font-semibold">
                            {formData.modulos.length} módulos
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Versão</p>
                          <p className="font-semibold">{formData.versao}</p>
                        </div>
                      </div>
                    </Card>
                    <p className="text-sm text-gray-600">
                      A IA irá refinar e organizar todo o conteúdo fornecido,
                      criando uma Especificação Funcional profissional e bem
                      estruturada.
                    </p>
                    <Button
                      onClick={handleGerar}
                      disabled={isProcessing}
                      className="w-full bg-geo-primary hover:bg-geo-primary/90 text-white h-12"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processando com IA...
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5 mr-2" />
                          Gerar Especificação Funcional
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < totalSteps && (
              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button onClick={handleNext} className="bg-geo-primary">
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Preview da EF Refinada */
          <EFPreview
            efRefinada={efRefinada!}
            onSalvar={handleSalvarEBaixar}
            onDescartar={() => setShowPreview(false)}
            isProcessing={isProcessing}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// Componente de Preview
function EFPreview({
  efRefinada,
  onSalvar,
  onDescartar,
  isProcessing,
}: {
  efRefinada: EFRefinada
  onSalvar: () => void
  onDescartar: () => void
  isProcessing: boolean
}) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 max-h-[60vh] overflow-y-auto">
        {/* Informações Básicas */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {efRefinada.informacoes_basicas.titulo}
          </h3>
          <p className="text-gray-600 mt-2">
            {efRefinada.informacoes_basicas.descricao}
          </p>
          {efRefinada.informacoes_basicas.descricao_resumida && (
            <p className="text-sm text-gray-500 mt-2 italic">
              {efRefinada.informacoes_basicas.descricao_resumida}
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <p className="text-gray-600">Versão</p>
              <p className="font-semibold">{efRefinada.informacoes_basicas.versao}</p>
            </div>
            <div>
              <p className="text-gray-600">Autor</p>
              <p className="font-semibold">{efRefinada.informacoes_basicas.autor}</p>
            </div>
            <div>
              <p className="text-gray-600">Módulo</p>
              <p className="font-semibold">{efRefinada.dados_sap.modulo}</p>
            </div>
            <div>
              <p className="text-gray-600">Empresa</p>
              <p className="font-semibold">{efRefinada.informacoes_basicas.empresa}</p>
            </div>
          </div>
          {efRefinada.consultor && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Consultor Responsável</p>
              <p className="font-semibold">
                {efRefinada.consultor.nome} - {efRefinada.consultor.cargo}
              </p>
            </div>
          )}
        </div>

        {/* Visão Geral */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Visão Geral</h4>
          <p className="text-gray-700 mb-3">{efRefinada.visao_geral.descricao}</p>
          <h5 className="font-medium mb-2">Objetivos:</h5>
          <ul className="list-disc list-inside space-y-1">
            {efRefinada.visao_geral.objetivos.map((obj, i) => (
              <li key={i} className="text-gray-700">
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Especificação */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Especificação</h4>
          <p className="text-gray-700 mb-4">{efRefinada.especificacao.introducao}</p>

          {efRefinada.especificacao.processos.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2">Processos:</h5>
              {efRefinada.especificacao.processos.map((proc, i) => (
                <div key={i} className="mb-3">
                  <p className="font-medium">{proc.nome}</p>
                  <p className="text-sm text-gray-600 mb-1">{proc.descricao}</p>
                  <ol className="list-decimal list-inside text-sm">
                    {proc.passos.map((passo, j) => (
                      <li key={j}>{passo}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recursos Técnicos */}
        {efRefinada.recursos_tecnicos.tabelas.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium mb-2">Tabelas:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {efRefinada.recursos_tecnicos.tabelas.map((tab, i) => (
                <div key={i} className="text-sm bg-white p-2 rounded">
                  <span className="font-mono font-semibold">{tab.nome}</span> -{" "}
                  {tab.descricao}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Botões */}
      <div className="flex gap-4">
        <Button
          onClick={onDescartar}
          variant="outline"
          className="flex-1"
          disabled={isProcessing}
        >
          Descartar
        </Button>
        <Button
          onClick={onSalvar}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando DOCX...
            </>
          ) : (
            "Baixar DOCX e Salvar"
          )}
        </Button>
      </div>
    </div>
  )
}

// Função para gerar HTML para PDF
function gerarHTMLParaPDF(ef: EFRefinada): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${ef.informacoes_basicas.titulo}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          line-height: 1.6;
        }
        h1 { color: #2b6cfd; border-bottom: 3px solid #2b6cfd; padding-bottom: 10px; }
        h2 { color: #5aa9ff; margin-top: 30px; }
        h3 { color: #333; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
        .info-item { padding: 10px; background: #f5f7fb; border-radius: 5px; }
        .label { font-weight: bold; color: #666; font-size: 0.9em; }
        ul, ol { margin-left: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #2b6cfd; color: white; }
      </style>
    </head>
    <body>
      <h1>${ef.informacoes_basicas.titulo}</h1>
      <p>${ef.informacoes_basicas.descricao}</p>

      <div class="info-grid">
        <div class="info-item">
          <div class="label">Versão</div>
          ${ef.informacoes_basicas.versao}
        </div>
        <div class="info-item">
          <div class="label">Autor</div>
          ${ef.informacoes_basicas.autor}
        </div>
        <div class="info-item">
          <div class="label">Módulo SAP</div>
          ${ef.dados_sap.modulo}
        </div>
        <div class="info-item">
          <div class="label">Empresa</div>
          ${ef.informacoes_basicas.empresa}
        </div>
      </div>

      <h2>Visão Geral</h2>
      <p>${ef.visao_geral.descricao}</p>
      <h3>Motivo</h3>
      <p>${ef.visao_geral.motivo}</p>
      <h3>Objetivos</h3>
      <ul>
        ${ef.visao_geral.objetivos.map((obj) => `<li>${obj}</li>`).join("")}
      </ul>

      <h2>Especificação Detalhada</h2>
      <p>${ef.especificacao.introducao}</p>

      ${
        ef.especificacao.processos.length > 0
          ? `
        <h3>Processos</h3>
        ${ef.especificacao.processos
          .map(
            (proc) => `
          <h4>${proc.nome}</h4>
          <p>${proc.descricao}</p>
          <ol>
            ${proc.passos.map((passo) => `<li>${passo}</li>`).join("")}
          </ol>
        `
          )
          .join("")}
      `
          : ""
      }

      ${
        ef.especificacao.regras_negocio.length > 0
          ? `
        <h3>Regras de Negócio</h3>
        <ul>
          ${ef.especificacao.regras_negocio
            .map((regra) => `<li>${regra}</li>`)
            .join("")}
        </ul>
      `
          : ""
      }

      ${
        ef.recursos_tecnicos.tabelas.length > 0
          ? `
        <h2>Tabelas SAP Utilizadas</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            ${ef.recursos_tecnicos.tabelas
              .map(
                (tab) => `
              <tr>
                <td><strong>${tab.nome}</strong></td>
                <td>${tab.tipo}</td>
                <td>${tab.descricao}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `
          : ""
      }

      ${
        ef.equipe.length > 0
          ? `
        <h2>Equipe do Projeto</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              ${ef.equipe.some((m) => m.email) ? "<th>Email</th>" : ""}
            </tr>
          </thead>
          <tbody>
            ${ef.equipe
              .map(
                (membro) => `
              <tr>
                <td>${membro.nome}</td>
                <td>${membro.cargo}</td>
                ${membro.email ? `<td>${membro.email}</td>` : ""}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `
          : ""
      }

      <hr style="margin-top: 40px;">
      <p style="text-align: center; color: #666; font-size: 0.9em;">
        Documento gerado por Abapfy - ${new Date().toLocaleDateString()}
      </p>
    </body>
    </html>
  `
}
