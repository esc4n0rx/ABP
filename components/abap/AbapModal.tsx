// components/abap/AbapModal.tsx

"use client"

import { useState, useRef } from "react"
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
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import {
  Upload,
  FileText,
  Code2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Plus,
  X,
} from "lucide-react"
import {
  AbapFormData,
  TIPOS_PROGRAMA_ABAP,
  TIPOS_TABELA_ABAP,
  TIPOS_FUNCAO_MODULO,
  TabelaABAP,
  CampoABAP,
  FuncaoModuloABAP,
} from "@/types/abap"
import { CodigoGeradoViewerV2 } from "./CodigoGeradoViewerV2"

interface AbapModalProps {
  open: boolean
  onClose: () => void
  onProgramaGerado: () => void
}

export function AbapModal({ open, onClose, onProgramaGerado }: AbapModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps, setTotalSteps] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingText, setStreamingText] = useState("")

  // Estado do formulário
  const [formData, setFormData] = useState<AbapFormData>({
    modo_criacao: "manual",
    tipo_programa: "REPORT",
    nome_programa: "",
    objetivo: "",
    logica_negocio: "",
    processos: [],
    regras_negocio: [],
    tabelas: [],
    campos: [],
    funcoes_modulos: [],
  })

  // Upload de EF
  const [efArquivo, setEfArquivo] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Resultado da geração
  const [resultado, setResultado] = useState<any>(null)
  const [perguntas, setPerguntas] = useState<any[] | null>(null)
  const [respostasPerguntas, setRespostasPerguntas] = useState<string[]>([])

  // Itens temporários para adição
  const [novaTabela, setNovaTabela] = useState<Partial<TabelaABAP>>({
    nome_tabela: "",
    descricao: "",
    tipo: "STANDARD",
  })

  const [novoCampo, setNovoCampo] = useState<Partial<CampoABAP>>({
    nome_campo: "",
    descricao: "",
    tipo_dado: "CHAR",
  })

  const [novaFuncao, setNovaFuncao] = useState<Partial<FuncaoModuloABAP>>({
    nome: "",
    descricao: "",
    tipo: "FM",
  })

  const handleClose = () => {
    // Reset state
    setCurrentStep(1)
    setTotalSteps(1)
    setFormData({
      modo_criacao: "manual",
      tipo_programa: "REPORT",
      nome_programa: "",
      objetivo: "",
      logica_negocio: "",
      processos: [],
      regras_negocio: [],
      tabelas: [],
      campos: [],
      funcoes_modulos: [],
    })
    setEfArquivo(null)
    setResultado(null)
    setPerguntas(null)
    setRespostasPerguntas([])
    setStreamingText("")
    onClose()
  }

  const handleModoChange = (modo: "upload" | "manual") => {
    setFormData({ ...formData, modo_criacao: modo })
    setTotalSteps(modo === "upload" ? 3 : 6)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validação de extensão no frontend
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext !== "txt" && ext !== "pdf") {
      toast.error("Apenas arquivos TXT ou PDF são permitidos")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    // Validação de tamanho no frontend (máximo 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Tamanho máximo: 10MB")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    const toastId = toast.loading(`Processando arquivo ${file.name}...`)

    try {
      // Criar FormData para enviar o arquivo
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      // Enviar para a API de upload
      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Erro ao processar arquivo")
      }

      // Sucesso - atualiza o estado com o texto extraído
      setEfArquivo(file)
      setFormData({
        ...formData,
        ef_texto: result.data.text,
        ef_arquivo: file.name as any,
      })

      toast.success(
        `Arquivo carregado com sucesso! ${result.data.wordCount} palavras extraídas.`,
        { id: toastId }
      )
    } catch (error: any) {
      console.error("Erro ao processar o arquivo:", error)

      // Limpa o estado em caso de erro
      setEfArquivo(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      const errorMessage = error.message || "Não foi possível processar o arquivo."
      toast.error(errorMessage, { id: toastId })
    }
  }

  const nextStep = () => {
    // Validações por step
    if (currentStep === 1 && formData.modo_criacao === "manual") {
      if (!formData.tipo_programa) {
        toast.error("Selecione o tipo de programa")
        return
      }
    }

    if (currentStep === 1 && formData.modo_criacao === "upload") {
      if (!efArquivo || !formData.ef_texto) {
        toast.error("Por favor, faça o upload de um arquivo TXT ou PDF com a especificação")
        return
      }
    }

    if (currentStep === 2 && formData.modo_criacao === "manual") {
      if (!formData.nome_programa || !formData.objetivo) {
        toast.error("Preencha o nome e objetivo do programa")
        return
      }
    }

    if (currentStep === 3 && formData.modo_criacao === "manual") {
      if (!formData.logica_negocio) {
        toast.error("Descreva a lógica de negócio")
        return
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const adicionarTabela = () => {
    if (!novaTabela.nome_tabela || !novaTabela.descricao) {
      toast.error("Preencha o nome e descrição da tabela")
      return
    }

    setFormData({
      ...formData,
      tabelas: [...formData.tabelas, novaTabela as TabelaABAP],
    })

    setNovaTabela({ nome_tabela: "", descricao: "", tipo: "STANDARD" })
    toast.success("Tabela adicionada!")
  }

  const removerTabela = (index: number) => {
    setFormData({
      ...formData,
      tabelas: formData.tabelas.filter((_, i) => i !== index),
    })
  }

  const adicionarCampo = () => {
    if (!novoCampo.nome_campo || !novoCampo.descricao) {
      toast.error("Preencha o nome e descrição do campo")
      return
    }

    setFormData({
      ...formData,
      campos: [...formData.campos, novoCampo as CampoABAP],
    })

    setNovoCampo({ nome_campo: "", descricao: "", tipo_dado: "CHAR" })
    toast.success("Campo adicionado!")
  }

  const removerCampo = (index: number) => {
    setFormData({
      ...formData,
      campos: formData.campos.filter((_, i) => i !== index),
    })
  }

  const adicionarFuncao = () => {
    if (!novaFuncao.nome || !novaFuncao.descricao) {
      toast.error("Preencha o nome e descrição da função")
      return
    }

    setFormData({
      ...formData,
      funcoes_modulos: [...formData.funcoes_modulos, novaFuncao as FuncaoModuloABAP],
    })

    setNovaFuncao({ nome: "", descricao: "", tipo: "FM" })
    toast.success("Função/Módulo adicionado!")
  }

  const removerFuncao = (index: number) => {
    setFormData({
      ...formData,
      funcoes_modulos: formData.funcoes_modulos.filter((_, i) => i !== index),
    })
  }

  const handleGerar = async () => {
    setIsGenerating(true)
    setStreamingText("")
    setResultado(null)
    setPerguntas(null)

    try {
      const response = await fetch("/api/abap/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          modo: "inicial",
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao gerar código")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("Reader não disponível")
      }

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))

            if (data.type === "token") {
              setStreamingText((prev) => prev + data.content)
            } else if (data.type === "done") {
              // Processo resposta completa
              if (data.resultado.tipo === "perguntas") {
                setPerguntas(data.resultado.perguntas)
                setRespostasPerguntas(new Array(data.resultado.perguntas.length).fill(""))
                toast.success("A IA precisa de mais informações")
              } else if (data.resultado.tipo === "codigo") {
                setResultado(data.resultado)
                toast.success("Código gerado com sucesso!")
              }
            } else if (data.type === "error") {
              toast.error(data.error)
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Erro ao gerar código:", error)
      toast.error("Erro ao gerar código ABAP")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleResponderPerguntas = async () => {
    // Valida se todas as perguntas foram respondidas
    if (respostasPerguntas.some((r) => !r || r.trim() === "")) {
      toast.error("Responda todas as perguntas")
      return
    }

    setIsGenerating(true)
    setStreamingText("")
    setResultado(null)

    try {
      const perguntasERespostas = perguntas!.map((p, i) => ({
        pergunta: p.pergunta,
        resposta: respostasPerguntas[i],
      }))

      const response = await fetch("/api/abap/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          perguntasERespostas,
          modo: "refinamento",
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao gerar código")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("Reader não disponível")
      }

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))

            if (data.type === "token") {
              setStreamingText((prev) => prev + data.content)
            } else if (data.type === "done") {
              if (data.resultado.tipo === "codigo") {
                setResultado(data.resultado)
                setPerguntas(null)
                toast.success("Código gerado com sucesso!")
              }
            } else if (data.type === "error") {
              toast.error(data.error)
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Erro ao gerar código:", error)
      toast.error("Erro ao gerar código ABAP")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSalvarPrograma = async () => {
    if (!resultado) return

    try {
      const response = await fetch("/api/abap/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programa: {
            nome_programa: formData.nome_programa,
            tipo_programa: formData.tipo_programa,
            descricao: formData.objetivo,
            status: "gerado",
            objetivo: formData.objetivo,
            logica_negocio: formData.logica_negocio,
            especificacao: formData.logica_negocio,
            ef_upload: formData.ef_texto || null,
            ef_arquivo: formData.ef_arquivo || null,
            codigo_gerado: resultado,
          },
          tabelas: formData.tabelas,
          campos: formData.campos,
          funcoes_modulos: formData.funcoes_modulos,
          processos: formData.processos,
          regras_negocio: formData.regras_negocio,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar programa")
      }

      toast.success("Programa salvo com sucesso!")
      onProgramaGerado()
      handleClose()
    } catch (error: any) {
      console.error("Erro ao salvar programa:", error)
      toast.error("Erro ao salvar programa")
    }
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* AQUI FOI ADICIONADO O ! PARA FORÇAR A LARGURA E ALTURA */}
      <DialogContent className="!max-w-[95vw] !w-[95vw] !max-h-[95vh] !h-[95vh] p-0 gap-0 flex flex-col">
        {/* Header fixo */}
        <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-geo-primary/5 to-purple-50 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-geo-primary/10 rounded-lg">
              <Code2 className="h-7 w-7 text-geo-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">Gerar Código ABAP com IA</div>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Assistente inteligente para geração de código SAP ABAP
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Área de conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-7xl mx-auto">

        {/* Progress Bar */}
        {!resultado && !perguntas && (
          <div className="mb-8">
            <Progress value={progressPercentage} className="h-2.5" />
          </div>
        )}

        {/* Steps Content */}
        <AnimatePresence mode="wait">
          {!resultado && !perguntas && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Step 1: Modo de Criação */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Como deseja criar o código ABAP?
                    </h3>
                    <p className="text-gray-600">
                      Escolha o método de entrada que melhor se adequa às suas necessidades
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    <button
                      onClick={() => handleModoChange("manual")}
                      className={`group p-8 rounded-2xl border-3 transition-all duration-200 ${
                        formData.modo_criacao === "manual"
                          ? "border-geo-primary bg-gradient-to-br from-geo-primary/10 to-geo-primary/5 shadow-lg scale-105"
                          : "border-gray-200 hover:border-geo-primary/50 hover:shadow-md hover:scale-102"
                      }`}
                    >
                      <div className={`p-4 rounded-xl mb-5 mx-auto w-fit ${
                        formData.modo_criacao === "manual"
                          ? "bg-geo-primary/20"
                          : "bg-gray-100 group-hover:bg-geo-primary/10"
                      }`}>
                        <Code2 className="h-12 w-12 text-geo-primary" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">
                        Criação Manual
                      </h4>
                      <p className="text-gray-600 text-base leading-relaxed">
                        Preencha um formulário interativo com campos estruturados para especificar todos os detalhes do seu programa ABAP
                      </p>
                      {formData.modo_criacao === "manual" && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-geo-primary font-medium">
                          <CheckCircle2 className="h-5 w-5" />
                          Selecionado
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => handleModoChange("upload")}
                      className={`group p-8 rounded-2xl border-3 transition-all duration-200 ${
                        formData.modo_criacao === "upload"
                          ? "border-geo-primary bg-gradient-to-br from-geo-primary/10 to-geo-primary/5 shadow-lg scale-105"
                          : "border-gray-200 hover:border-geo-primary/50 hover:shadow-md hover:scale-102"
                      }`}
                    >
                      <div className={`p-4 rounded-xl mb-5 mx-auto w-fit ${
                        formData.modo_criacao === "upload"
                          ? "bg-geo-primary/20"
                          : "bg-gray-100 group-hover:bg-geo-primary/10"
                      }`}>
                        <Upload className="h-12 w-12 text-geo-primary" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">
                        Upload de Especificação
                      </h4>
                      <p className="text-gray-600 text-base leading-relaxed">
                        Carregue um arquivo TXT ou PDF contendo a especificação funcional completa do programa desejado
                      </p>
                      {formData.modo_criacao === "upload" && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-geo-primary font-medium">
                          <CheckCircle2 className="h-5 w-5" />
                          Selecionado
                        </div>
                      )}
                    </button>
                  </div>

                  {formData.modo_criacao === "upload" && (
                    <div className="max-w-2xl mx-auto space-y-4">
                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          Upload de Arquivo (TXT ou PDF) *
                        </Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          size="lg"
                          className="w-full h-20 text-base border-2 border-dashed hover:border-geo-primary hover:bg-geo-primary/5"
                        >
                          <Upload className="h-6 w-6 mr-3 text-geo-primary" />
                          {efArquivo ? efArquivo.name : "Clique para selecionar o arquivo de especificação"}
                        </Button>
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          Formatos aceitos: .txt, .pdf • Tamanho máximo: 10 MB
                        </p>
                      </div>
                      {efArquivo && (
                        <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                          <div className="flex items-center gap-3 text-green-700">
                            <CheckCircle2 className="h-6 w-6" />
                            <div>
                              <div className="font-semibold text-lg">Arquivo carregado com sucesso!</div>
                              <p className="text-sm text-green-600 mt-1">
                                {efArquivo.name} • {(efArquivo.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.modo_criacao === "manual" && (
                    <div className="max-w-2xl mx-auto">
                      <Label className="text-base font-semibold mb-3 block">
                        Tipo de Programa ABAP *
                      </Label>
                      <Select
                        value={formData.tipo_programa}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, tipo_programa: value })
                        }
                      >
                        <SelectTrigger className="h-14 text-base border-2">
                          <SelectValue placeholder="Selecione o tipo de programa..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                          {TIPOS_PROGRAMA_ABAP.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value} className="py-3">
                              <div>
                                <div className="font-semibold text-base">{tipo.label}</div>
                                <div className="text-sm text-gray-500 mt-0.5">{tipo.descricao}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-2">
                        Escolha o tipo que melhor se adequa ao programa que deseja gerar
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Nome e Objetivo (Manual) */}
              {currentStep === 2 && formData.modo_criacao === "manual" && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Especificação do Programa
                    </h3>
                    <p className="text-gray-600">
                      Defina o nome e objetivo principal do programa ABAP
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-8 space-y-6">
                      <div>
                        <Label className="text-lg font-semibold mb-3 block">
                          Nome do Programa *
                        </Label>
                        <Input
                          value={formData.nome_programa}
                          onChange={(e) =>
                            setFormData({ ...formData, nome_programa: e.target.value })
                          }
                          placeholder="Ex: ZREP_VENDAS_REGIONAL"
                          maxLength={40}
                          className="text-base h-12 border-2"
                        />
                        <p className="text-sm text-gray-500 mt-2 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">ℹ️</span>
                          <span>Máximo 40 caracteres (padrão SAP). Use prefixo <code className="bg-gray-100 px-1.5 py-0.5 rounded">Z*</code> ou <code className="bg-gray-100 px-1.5 py-0.5 rounded">Y*</code> para objetos customizados</span>
                        </p>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold mb-3 block">
                          Objetivo do Programa *
                        </Label>
                        <Textarea
                          value={formData.objetivo}
                          onChange={(e) =>
                            setFormData({ ...formData, objetivo: e.target.value })
                          }
                          placeholder="Ex: Relatório ALV interativo de vendas por região com drill-down por cliente e produto, permitindo análise detalhada de performance de vendas..."
                          rows={5}
                          className="text-base border-2 resize-none"
                        />
                        <p className="text-sm text-gray-500 mt-2 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">ℹ️</span>
                          <span>Descreva de forma clara e objetiva o propósito principal do programa e o que ele deve fazer</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Lógica de Negócio (Manual) */}
              {currentStep === 3 && formData.modo_criacao === "manual" && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Lógica de Negócio e Processamento
                    </h3>
                    <p className="text-gray-600">
                      Detalhe como o programa deve funcionar, fluxo de processamento e regras de negócio
                    </p>
                  </div>

                  <div className="max-w-5xl mx-auto space-y-6">
                    {/* Lógica Principal */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <span className="text-2xl">🎯</span>
                        </div>
                        <div className="flex-1">
                          <Label className="text-lg font-bold text-gray-900 mb-1 block">
                            Lógica Principal *
                          </Label>
                          <p className="text-sm text-gray-600">
                            Descreva o funcionamento geral, integrações e processamento
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-red-100 border-red-300 text-red-700">
                          Obrigatório
                        </Badge>
                      </div>
                      <Textarea
                        value={formData.logica_negocio}
                        onChange={(e) =>
                          setFormData({ ...formData, logica_negocio: e.target.value })
                        }
                        placeholder="Ex: O relatório deve buscar dados de vendas (VBRK/VBRP) cruzando com clientes (KNA1) e materiais (MARA). Permitir filtro por período, região e status. Exibir em ALV com drill-down para detalhes de itens. Incluir totalizações por região..."
                        rows={6}
                        className="text-base border-2 resize-none bg-white"
                      />
                    </div>

                    {/* Fluxo de Processo */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <span className="text-2xl">📋</span>
                        </div>
                        <div className="flex-1">
                          <Label className="text-lg font-bold text-gray-900 mb-1 block">
                            Fluxo de Processo
                          </Label>
                          <p className="text-sm text-gray-600">
                            Liste os passos do processamento, um por linha
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 border-blue-300 text-blue-700">
                          Opcional
                        </Badge>
                      </div>
                      <Textarea
                        value={formData.processos?.join('\n') || ''}
                        onChange={(e) => {
                          const processosArray = e.target.value
                            .split('\n')
                            .filter(p => p.trim() !== '')
                          setFormData({ ...formData, processos: processosArray })
                        }}
                        placeholder="Liste os passos (um por linha):&#10;1. Seleção de dados com JOIN de VBRK, VBRP, KNA1 e MARA&#10;2. Agregação de valores por região e cliente&#10;3. Formatação de campos (valores, datas, percentuais)&#10;4. Exibição em ALV Grid com layout customizado&#10;5. Implementação de eventos ALV (duplo clique, hotspot)"
                        rows={7}
                        className="text-base font-mono text-sm border-2 resize-none bg-white"
                      />
                      <p className="text-sm text-blue-600 mt-2 flex items-start gap-2">
                        <span className="mt-0.5">💡</span>
                        <span>Cada linha vira um passo. Isso ajuda a IA a estruturar melhor o código subdividido</span>
                      </p>
                    </div>

                    {/* Regras de Negócio */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <span className="text-2xl">⚖️</span>
                        </div>
                        <div className="flex-1">
                          <Label className="text-lg font-bold text-gray-900 mb-1 block">
                            Regras de Negócio
                          </Label>
                          <p className="text-sm text-gray-600">
                            Defina validações, restrições e tratamentos especiais
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-purple-100 border-purple-300 text-purple-700">
                          Opcional
                        </Badge>
                      </div>
                      <Textarea
                        value={formData.regras_negocio?.join('\n') || ''}
                        onChange={(e) => {
                          const regrasArray = e.target.value
                            .split('\n')
                            .filter(r => r.trim() !== '')
                          setFormData({ ...formData, regras_negocio: regrasArray })
                        }}
                        placeholder="Liste as regras (uma por linha):&#10;- Considerar apenas documentos com status 'C' (Completo) e tipo 'F2' (Fatura)&#10;- Cálculo de desconto: (Valor Bruto - Valor Líquido) / Valor Bruto * 100&#10;- Destacar em vermelho vendas com desconto > 20%&#10;- Destacar em verde vendas acima de R$ 100.000&#10;- Período padrão: últimos 3 meses&#10;- Validar autorização S_VBRK_REG"
                        rows={7}
                        className="text-base font-mono text-sm border-2 resize-none bg-white"
                      />
                      <p className="text-sm text-purple-600 mt-2 flex items-start gap-2">
                        <span className="mt-0.5">💡</span>
                        <span>Inclua cálculos, validações, permissões e formatações especiais</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Tabelas, Campos, Funções (Manual) */}
              {currentStep === 4 && formData.modo_criacao === "manual" && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Recursos Técnicos
                    </h3>
                    <p className="text-gray-600">
                      Especifique as tabelas SAP e funções/módulos que serão utilizados
                    </p>
                  </div>

                  <div className="max-w-6xl mx-auto space-y-8">
                    {/* Tabelas */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <span className="text-2xl">📊</span>
                        </div>
                        <div className="flex-1">
                          <Label className="text-lg font-bold text-gray-900 mb-1 block">
                            Tabelas SAP a Utilizar
                          </Label>
                          <p className="text-sm text-gray-600">
                            Informe as tabelas do dicionário de dados SAP que serão consultadas
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 border-blue-300 text-blue-700">
                          Opcional
                        </Badge>
                      </div>

                      <div className="bg-white rounded-lg p-5 border-2 border-blue-200">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                          <div className="lg:col-span-3">
                            <Input
                              placeholder="Nome (ex: VBRK)"
                              value={novaTabela.nome_tabela}
                              onChange={(e) =>
                                setNovaTabela({ ...novaTabela, nome_tabela: e.target.value.toUpperCase() })
                              }
                              className="h-11 border-2"
                            />
                          </div>
                          <div className="lg:col-span-5">
                            <Input
                              placeholder="Descrição (ex: Cabeçalho de Documentos de Faturamento)"
                              value={novaTabela.descricao}
                              onChange={(e) =>
                                setNovaTabela({ ...novaTabela, descricao: e.target.value })
                              }
                              className="h-11 border-2"
                            />
                          </div>
                          <div className="lg:col-span-3">
                            <Select
                              value={novaTabela.tipo}
                              onValueChange={(value: any) =>
                                setNovaTabela({ ...novaTabela, tipo: value })
                              }
                            >
                              <SelectTrigger className="h-11 border-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_TABELA_ABAP.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="lg:col-span-1">
                            <Button
                              onClick={adicionarTabela}
                              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {formData.tabelas.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            {formData.tabelas.length} tabela(s) adicionada(s):
                          </p>
                          {formData.tabelas.map((tabela, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors"
                            >
                              <div className="flex-1">
                                <span className="font-bold text-lg text-blue-700">{tabela.nome_tabela}</span>
                                <span className="text-gray-400 mx-3">•</span>
                                <span className="text-gray-700">{tabela.descricao}</span>
                                <Badge variant="outline" className="ml-3 bg-blue-50 border-blue-300">
                                  {tabela.tipo}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removerTabela(i)}
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Funções/Módulos a Reaproveitar */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-300 rounded-xl p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <span className="text-2xl">⚙️</span>
                        </div>
                        <div className="flex-1">
                          <Label className="text-lg font-bold text-gray-900 mb-1 block">
                            Funções/Módulos a Reaproveitar
                          </Label>
                          <p className="text-sm text-gray-600">
                            Liste BAPIs, Function Modules, Métodos ou Classes que serão chamados
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-purple-100 border-purple-300 text-purple-700">
                          Opcional
                        </Badge>
                      </div>

                      <div className="bg-white rounded-lg p-5 border-2 border-purple-200">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                          <div className="lg:col-span-4">
                            <Input
                              placeholder="Nome (ex: BAPI_SALESORDER_CREATEFROMDAT2)"
                              value={novaFuncao.nome}
                              onChange={(e) =>
                                setNovaFuncao({ ...novaFuncao, nome: e.target.value.toUpperCase() })
                              }
                              className="h-11 border-2"
                            />
                          </div>
                          <div className="lg:col-span-5">
                            <Input
                              placeholder="Descrição (ex: Criar Ordem de Venda)"
                              value={novaFuncao.descricao}
                              onChange={(e) =>
                                setNovaFuncao({ ...novaFuncao, descricao: e.target.value })
                              }
                              className="h-11 border-2"
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <Select
                              value={novaFuncao.tipo}
                              onValueChange={(value: any) =>
                                setNovaFuncao({ ...novaFuncao, tipo: value })
                              }
                            >
                              <SelectTrigger className="h-11 border-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_FUNCAO_MODULO.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="lg:col-span-1">
                            <Button
                              onClick={adicionarFuncao}
                              className="w-full h-11 bg-purple-600 hover:bg-purple-700"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {formData.funcoes_modulos.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            {formData.funcoes_modulos.length} função(ões) adicionada(s):
                          </p>
                          {formData.funcoes_modulos.map((funcao, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 transition-colors"
                            >
                              <div className="flex-1">
                                <span className="font-bold text-lg text-purple-700">{funcao.nome}</span>
                                <span className="text-gray-400 mx-3">•</span>
                                <span className="text-gray-700">{funcao.descricao}</span>
                                <Badge variant="outline" className="ml-3 bg-purple-50 border-purple-300">
                                  {funcao.tipo}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removerFuncao(i)}
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Resumo e Gerar (Manual) ou Step 2 (Upload) */}
              {((currentStep === 5 && formData.modo_criacao === "manual") ||
                (currentStep === 2 && formData.modo_criacao === "upload")) && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Resumo e Geração
                    </h3>
                    <p className="text-gray-600">
                      Revise as informações e clique em "Gerar Código" para iniciar o processamento pela IA
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Sparkles className="h-8 w-8 text-geo-primary" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">Especificações Fornecidas</h4>
                          <p className="text-sm text-gray-600">Resumo das informações coletadas</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-5 border-2 border-gray-200">
                          <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Modo de Criação</div>
                          <p className="text-lg font-bold text-gray-900">
                            {formData.modo_criacao === "manual"
                              ? "📝 Criação Manual"
                              : "📄 Upload de Especificação"}
                          </p>
                        </div>

                        {formData.modo_criacao === "manual" && (
                          <>
                            <div className="bg-white rounded-xl p-5 border-2 border-gray-200">
                              <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tipo de Programa</div>
                              <p className="text-lg font-bold text-gray-900">
                                {TIPOS_PROGRAMA_ABAP.find((t) => t.value === formData.tipo_programa)?.label}
                              </p>
                            </div>

                            <div className="bg-white rounded-xl p-5 border-2 border-gray-200">
                              <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Nome do Programa</div>
                              <p className="text-lg font-bold text-geo-primary font-mono">
                                {formData.nome_programa || "Não informado"}
                              </p>
                            </div>

                            <div className="bg-white rounded-xl p-5 border-2 border-gray-200">
                              <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Recursos</div>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-700">
                                  📊 <span className="font-semibold">{formData.tabelas.length}</span> tabela(s)
                                </p>
                                <p className="text-sm text-gray-700">
                                  ⚙️ <span className="font-semibold">{formData.funcoes_modulos.length}</span> função(ões)
                                </p>
                              </div>
                            </div>
                          </>
                        )}

                        {formData.modo_criacao === "upload" && (
                          <div className="bg-white rounded-xl p-5 border-2 border-gray-200 md:col-span-1">
                            <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Arquivo Enviado</div>
                            <p className="text-lg font-bold text-gray-900 truncate">
                              {efArquivo?.name ?? (typeof formData.ef_arquivo === "string" ? formData.ef_arquivo : "Nenhum arquivo")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <HelpCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-blue-900 mb-2 text-lg">Como funciona a geração?</p>
                          <p className="text-blue-800 leading-relaxed">
                            A IA analisará suas informações e pode fazer até <strong>3 perguntas</strong> para esclarecer detalhes.
                            Caso todas as informações estejam claras, o código será gerado diretamente com <strong>subdivisão inteligente</strong> em múltiplos artefatos.
                          </p>
                        </div>
                      </div>
                    </div>

                    {isGenerating && (
                      <div className="bg-white border-2 border-geo-primary rounded-xl p-8 shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-3 bg-geo-primary/10 rounded-xl">
                            <Loader2 className="h-8 w-8 animate-spin text-geo-primary" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-geo-primary">Gerando código ABAP...</div>
                            <p className="text-sm text-gray-600">A IA está processando suas especificações</p>
                          </div>
                        </div>
                        {streamingText && (
                          <div className="bg-gray-50 rounded-lg p-5 font-mono text-sm overflow-x-auto max-h-[300px] overflow-y-auto border-2 border-gray-200">
                            {streamingText}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Perguntas da IA */}
          {perguntas && !resultado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 mb-1">
                      A IA precisa de mais informações
                    </p>
                    <p className="text-sm text-yellow-700">
                      Responda as perguntas abaixo para gerar um código mais preciso
                    </p>
                  </div>
                </div>
              </div>

              {perguntas.map((pergunta, i) => (
                <div key={i} className="space-y-2">
                  <Label className="text-base">
                    {i + 1}. {pergunta.pergunta}
                  </Label>
                  {pergunta.contexto && (
                    <p className="text-sm text-gray-600">{pergunta.contexto}</p>
                  )}
                  <Textarea
                    value={respostasPerguntas[i] || ""}
                    onChange={(e) => {
                      const novasRespostas = [...respostasPerguntas]
                      novasRespostas[i] = e.target.value
                      setRespostasPerguntas(novasRespostas)
                    }}
                    placeholder="Sua resposta..."
                    rows={3}
                  />
                </div>
              ))}

              <Button
                onClick={handleResponderPerguntas}
                disabled={isGenerating}
                className="w-full bg-geo-primary hover:bg-geo-primary/90 h-12 text-base"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando código...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar Código com Respostas
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Resultado do Código Gerado */}
          {resultado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CodigoGeradoViewerV2
                codigo={resultado}
                tipoPrograma={formData.tipo_programa}
                nomePrincipal={formData.nome_programa}
              />

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleSalvarPrograma}
                  className="flex-1 bg-geo-primary hover:bg-geo-primary/90"
                  size="lg"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Salvar Programa
                </Button>
                <Button
                  onClick={() => {
                    setResultado(null)
                    setCurrentStep(1)
                  }}
                  variant="outline"
                  size="lg"
                >
                  Gerar Novo
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>

        {/* Footer fixo com botões de navegação */}
        {!resultado && !perguntas && (
          <div className="px-8 py-5 border-t bg-gray-50/50 shrink-0">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1 || isGenerating}
                variant="outline"
                size="lg"
                className="px-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="text-sm text-gray-600">
                Passo <span className="font-semibold text-gray-900">{currentStep}</span> de <span className="font-semibold text-gray-900">{totalSteps}</span>
              </div>

              {((currentStep === 5 && formData.modo_criacao === "manual") ||
                (currentStep === 2 && formData.modo_criacao === "upload")) ? (
                <Button
                  onClick={handleGerar}
                  disabled={isGenerating}
                  className="bg-geo-primary hover:bg-geo-primary/90 px-8"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Gerar Código
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={isGenerating}
                  className="bg-geo-primary hover:bg-geo-primary/90 px-8"
                  size="lg"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}