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
import * as pdfjsLib from "pdfjs-dist"
import {
  AbapFormData,
  TIPOS_PROGRAMA_ABAP,
  TIPOS_TABELA_ABAP,
  TIPOS_FUNCAO_MODULO,
  TabelaABAP,
  CampoABAP,
  FuncaoModuloABAP,
} from "@/types/abap"
import { CodigoGeradoViewer } from "./CodigoGeradoViewer"

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

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

    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext !== "txt" && ext !== "pdf") {
      toast.error("Apenas arquivos TXT ou PDF são permitidos")
      return
    }

    setEfArquivo(file)
    const toastId = toast.loading(`Lendo arquivo ${file.name}...`)

    try {
      let text = ""
      if (ext === "txt") {
        text = await file.text()
      } else if (ext === "pdf") {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ""
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n"
        }
        text = fullText
      }

      setFormData({
        ...formData,
        ef_texto: text,
        ef_arquivo: file.name as any,
      })
      toast.success("Arquivo carregado e processado com sucesso!", { id: toastId })
    } catch (error: any) {
      console.error("Erro ao processar o arquivo:", error)
      let errorMessage = "Não foi possível ler o conteúdo do arquivo."
      if (error.name === "MissingPDFException") {
        errorMessage = "Arquivo PDF inválido ou corrompido."
      } else if (error.name === "UnexpectedResponseException") {
        errorMessage = "Erro de rede ao carregar o PDF. Verifique sua conexão."
      } else if (error.message?.includes("password")) {
        errorMessage = "Este PDF está protegido por senha e não pode ser lido."
      }
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Code2 className="h-6 w-6 text-geo-primary" />
            Gerar Código ABAP com IA
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        {!resultado && !perguntas && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Passo {currentStep} de {totalSteps}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Como deseja criar o código ABAP?
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleModoChange("manual")}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.modo_criacao === "manual"
                          ? "border-geo-primary bg-geo-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Code2 className="h-10 w-10 text-geo-primary mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Criação Manual
                      </h4>
                      <p className="text-sm text-gray-600">
                        Defina os detalhes do programa step by step
                      </p>
                    </button>

                    <button
                      onClick={() => handleModoChange("upload")}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.modo_criacao === "upload"
                          ? "border-geo-primary bg-geo-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Upload className="h-10 w-10 text-geo-primary mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Upload de Especificação
                      </h4>
                      <p className="text-sm text-gray-600">
                        Carregue um arquivo TXT ou PDF com a especificação
                      </p>
                    </button>
                  </div>

                  {formData.modo_criacao === "upload" && (
                    <div className="mt-6">
                      <Label>Upload de Arquivo (TXT ou PDF)</Label>
                      <div className="mt-2">
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
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {efArquivo ? efArquivo.name : "Selecionar arquivo"}
                        </Button>
                      </div>
                      {efArquivo && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">Arquivo carregado com sucesso!</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            {efArquivo.name} ({(efArquivo.size / 1024).toFixed(2)} KB)
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.modo_criacao === "manual" && (
                    <div className="mt-6">
                      <Label>Tipo de Programa *</Label>
                      <Select
                        value={formData.tipo_programa}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, tipo_programa: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {TIPOS_PROGRAMA_ABAP.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              <div>
                                <div className="font-medium">{tipo.label}</div>
                                <div className="text-xs text-gray-500">{tipo.descricao}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Nome e Objetivo (Manual) */}
              {currentStep === 2 && formData.modo_criacao === "manual" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Especificação do Programa
                  </h3>

                  <div>
                    <Label>Nome do Programa *</Label>
                    <Input
                      value={formData.nome_programa}
                      onChange={(e) =>
                        setFormData({ ...formData, nome_programa: e.target.value })
                      }
                      placeholder="Ex: Z_REPORT_VENDAS"
                      maxLength={40}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo 40 caracteres (padrão SAP)
                    </p>
                  </div>

                  <div>
                    <Label>Objetivo do Programa *</Label>
                    <Textarea
                      value={formData.objetivo}
                      onChange={(e) =>
                        setFormData({ ...formData, objetivo: e.target.value })
                      }
                      placeholder="Descreva o objetivo principal do programa..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Lógica de Negócio (Manual) */}
              {currentStep === 3 && formData.modo_criacao === "manual" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lógica de Negócio
                  </h3>

                  <div>
                    <Label>Descreva a Lógica de Negócio *</Label>
                    <Textarea
                      value={formData.logica_negocio}
                      onChange={(e) =>
                        setFormData({ ...formData, logica_negocio: e.target.value })
                      }
                      placeholder="Explique como o programa deve funcionar, quais regras aplicar, processamento esperado, etc."
                      rows={8}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Tabelas, Campos, Funções (Manual) */}
              {currentStep === 4 && formData.modo_criacao === "manual" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recursos Técnicos
                  </h3>

                  {/* Tabelas */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Tabelas SAP a Utilizar
                    </Label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <Input
                        placeholder="Nome da tabela"
                        value={novaTabela.nome_tabela}
                        onChange={(e) =>
                          setNovaTabela({ ...novaTabela, nome_tabela: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Descrição"
                        value={novaTabela.descricao}
                        onChange={(e) =>
                          setNovaTabela({ ...novaTabela, descricao: e.target.value })
                        }
                      />
                      <div className="flex gap-2">
                        <Select
                          value={novaTabela.tipo}
                          onValueChange={(value: any) =>
                            setNovaTabela({ ...novaTabela, tipo: value })
                          }
                        >
                          <SelectTrigger>
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
                        <Button onClick={adicionarTabela} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {formData.tabelas.length > 0 && (
                      <div className="space-y-2">
                        {formData.tabelas.map((tabela, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <span className="font-medium">{tabela.nome_tabela}</span>
                              <span className="text-sm text-gray-500 mx-2">-</span>
                              <span className="text-sm text-gray-600">
                                {tabela.descricao}
                              </span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {tabela.tipo}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerTabela(i)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Funções/Módulos a Reaproveitar */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Funções/Módulos a Reaproveitar (opcional)
                    </Label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <Input
                        placeholder="Nome da função/módulo"
                        value={novaFuncao.nome}
                        onChange={(e) =>
                          setNovaFuncao({ ...novaFuncao, nome: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Descrição"
                        value={novaFuncao.descricao}
                        onChange={(e) =>
                          setNovaFuncao({ ...novaFuncao, descricao: e.target.value })
                        }
                      />
                      <div className="flex gap-2">
                        <Select
                          value={novaFuncao.tipo}
                          onValueChange={(value: any) =>
                            setNovaFuncao({ ...novaFuncao, tipo: value })
                          }
                        >
                          <SelectTrigger>
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
                        <Button onClick={adicionarFuncao} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {formData.funcoes_modulos.length > 0 && (
                      <div className="space-y-2">
                        {formData.funcoes_modulos.map((funcao, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <span className="font-medium">{funcao.nome}</span>
                              <span className="text-sm text-gray-500 mx-2">-</span>
                              <span className="text-sm text-gray-600">
                                {funcao.descricao}
                              </span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {funcao.tipo}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerFuncao(i)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Resumo e Gerar (Manual) ou Step 2 (Upload) */}
              {((currentStep === 5 && formData.modo_criacao === "manual") ||
                (currentStep === 2 && formData.modo_criacao === "upload")) && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Resumo e Geração
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Modo:</span>
                      <p className="text-gray-900">
                        {formData.modo_criacao === "manual"
                          ? "Criação Manual"
                          : "Upload de Especificação"}
                      </p>
                    </div>

                    {formData.modo_criacao === "manual" && (
                      <>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Tipo:</span>
                          <p className="text-gray-900">
                            {
                              TIPOS_PROGRAMA_ABAP.find(
                                (t) => t.value === formData.tipo_programa
                              )?.label
                            }
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-600">Nome:</span>
                          <p className="text-gray-900">{formData.nome_programa}</p>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            Tabelas:
                          </span>
                          <p className="text-gray-900">
                            {formData.tabelas.length} tabela(s)
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            Funções/Módulos:
                          </span>
                          <p className="text-gray-900">
                            {formData.funcoes_modulos.length} item(ns)
                          </p>
                        </div>
                      </>
                    )}

                    {formData.modo_criacao === "upload" && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Arquivo:</span>
                        <p className="text-gray-900">
                          {efArquivo?.name ?? (typeof formData.ef_arquivo === "string" ? formData.ef_arquivo : "Nenhum arquivo selecionado")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Como funciona a geração?</p>
                        <p className="text-blue-700">
                          A IA analisará suas informações. Se precisar de mais detalhes,
                          fará até 3 perguntas. Caso contrário, gerará o código
                          diretamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {isGenerating && (
                    <div className="bg-white border-2 border-geo-primary/20 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Loader2 className="h-6 w-6 animate-spin text-geo-primary" />
                        <span className="font-medium text-geo-primary">
                          Gerando código...
                        </span>
                      </div>
                      {streamingText && (
                        <div className="bg-gray-50 rounded p-4 font-mono text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
                          {streamingText}
                        </div>
                      )}
                    </div>
                  )}
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
                className="w-full bg-geo-primary hover:bg-geo-primary/90"
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
              <CodigoGeradoViewer codigo={resultado} />

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

        {/* Footer com botões de navegação */}
        {!resultado && !perguntas && (
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1 || isGenerating}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {((currentStep === 5 && formData.modo_criacao === "manual") ||
              (currentStep === 2 && formData.modo_criacao === "upload")) ? (
              <Button
                onClick={handleGerar}
                disabled={isGenerating}
                className="bg-geo-primary hover:bg-geo-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Código
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={isGenerating}
                className="bg-geo-primary hover:bg-geo-primary/90"
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
