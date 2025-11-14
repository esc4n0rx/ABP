"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import {
  Send,
  Plus,
  FolderOpen,
  Trash2,
  Edit,
  MessageSquare,
  Loader2,
} from "lucide-react"
import toast from "react-hot-toast"
import { ChatMensagem, ChatProjeto, ChatHistorico } from "@/types/chat"
import { MessageList } from "@/components/chat/MessageList"
import { ProjectModal } from "@/components/chat/ProjectModal"

export function Chat() {
  const [mensagens, setMensagens] = useState<ChatMensagem[]>([])
  const [projetos, setProjetos] = useState<ChatProjeto[]>([])
  const [projetoAtual, setProjetoAtual] = useState<ChatProjeto | null>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ChatProjeto | null>(null)

  useEffect(() => {
    carregarProjetos()
  }, [])

  useEffect(() => {
    if (projetoAtual) {
      carregarMensagens(projetoAtual.id!)
    } else {
      carregarMensagens(null)
    }
  }, [projetoAtual])

  const carregarProjetos = async () => {
    try {
      const response = await fetch("/api/chat/projetos")
      if (response.ok) {
        const data = await response.json()
        setProjetos(data.projetos || [])
      }
    } catch (error) {
      console.error("Erro ao carregar projetos:", error)
    }
  }

  const carregarMensagens = async (projeto_id: string | null) => {
    try {
      const url =
        projeto_id === null
          ? "/api/chat/mensagens?projeto_id=null"
          : `/api/chat/mensagens?projeto_id=${projeto_id}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMensagens(data.mensagens || [])
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const mensagemTexto = input.trim()
    setInput("")
    setIsLoading(true)

    // Adiciona mensagem do usuário localmente
    const mensagemUser: ChatMensagem = {
      id: Date.now().toString(),
      role: "user",
      conteudo: mensagemTexto,
      criado_em: new Date().toISOString(),
    }
    setMensagens((prev) => [...prev, mensagemUser])

    try {
      // Prepara histórico
      const historico: ChatHistorico[] = mensagens.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.conteudo_limpo || m.conteudo,
      }))

      // Faz request com stream
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem: mensagemTexto,
          projeto_id: projetoAtual?.id || null,
          contexto_projeto: projetoAtual?.contexto || undefined,
          historico,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro na resposta da API")
      }

      // Processa stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No reader available")

      setIsTyping(true)
      setTypingText("")

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
              setTypingText((prev) => prev + data.content)
            } else if (data.type === "done") {
              setIsTyping(false)
              // Recarrega mensagens para pegar a salva no banco
              await carregarMensagens(projetoAtual?.id || null)
              await carregarProjetos() // Atualiza lista de projetos
            } else if (data.type === "error") {
              toast.error(data.error || "Erro ao processar mensagem")
              setIsTyping(false)
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error)
      toast.error(error.message || "Erro ao enviar mensagem")
      setIsTyping(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNovoChat = () => {
    setProjetoAtual(null)
    setMensagens([])
  }

  const handleNovoProjeto = () => {
    setEditingProject(null)
    setProjectModalOpen(true)
  }

  const handleEditarProjeto = (projeto: ChatProjeto) => {
    setEditingProject(projeto)
    setProjectModalOpen(true)
  }

  const handleDeletarProjeto = async (projeto: ChatProjeto) => {
    if (!confirm(`Deletar projeto "${projeto.nome}"? Todas as mensagens serão removidas.`))
      return

    try {
      const response = await fetch(`/api/chat/projetos/${projeto.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Projeto deletado")
        if (projetoAtual?.id === projeto.id) {
          handleNovoChat()
        }
        await carregarProjetos()
      } else {
        toast.error("Erro ao deletar projeto")
      }
    } catch (error) {
      toast.error("Erro ao deletar projeto")
    }
  }

  const handleLimparConversa = async () => {
    if (!confirm("Limpar todas as mensagens desta conversa?")) return

    try {
      const url = projetoAtual
        ? `/api/chat/mensagens?projeto_id=${projetoAtual.id}`
        : "/api/chat/mensagens?projeto_id=null"

      const response = await fetch(url, { method: "DELETE" })

      if (response.ok) {
        toast.success("Conversa limpa")
        setMensagens([])
      } else {
        toast.error("Erro ao limpar conversa")
      }
    } catch (error) {
      toast.error("Erro ao limpar conversa")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chat SAP Assistant
        </h1>
        <p className="text-gray-600">
          Assistente especializado em SAP, ABAP, Fiori e tecnologias relacionadas
        </p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar - Projetos */}
        <Card className="w-80 flex flex-col p-4 bg-white border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Projetos</h3>
            <Button
              onClick={handleNovoProjeto}
              size="sm"
              className="bg-geo-primary"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleNovoChat}
            variant={projetoAtual === null ? "default" : "outline"}
            className={`w-full justify-start mb-4 ${
              projetoAtual === null ? "bg-geo-primary" : ""
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat Geral
          </Button>

          <div className="flex-1 overflow-y-auto space-y-2">
            {projetos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum projeto criado ainda
              </p>
            ) : (
              projetos.map((projeto) => (
                <Card
                  key={projeto.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    projetoAtual?.id === projeto.id
                      ? "border-2 border-geo-primary bg-geo-primary/5"
                      : ""
                  }`}
                  onClick={() => setProjetoAtual(projeto)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: projeto.cor }}
                        />
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {projeto.nome}
                        </h4>
                      </div>
                      {projeto.descricao && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {projeto.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{projeto.total_mensagens || 0} msgs</span>
                        {projeto.ultima_mensagem_em && (
                          <span>
                            {new Date(
                              projeto.ultima_mensagem_em
                            ).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditarProjeto(projeto)
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletarProjeto(projeto)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>

        {/* Chat Principal */}
        <Card className="flex-1 flex flex-col bg-white border-gray-200 shadow-sm overflow-hidden">
          {/* Header do Chat */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              {projetoAtual ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: projetoAtual.cor }}
                  />
                  <h3 className="font-semibold text-gray-900">
                    {projetoAtual.nome}
                  </h3>
                </div>
              ) : (
                <h3 className="font-semibold text-gray-900">Chat Geral</h3>
              )}
              {projetoAtual?.contexto && (
                <p className="text-xs text-gray-500 mt-1">
                  Contexto ativo
                </p>
              )}
            </div>
            <Button
              onClick={handleLimparConversa}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>

          {/* Mensagens */}
          <MessageList
            mensagens={mensagens}
            isTyping={isTyping}
            typingText={typingText}
          />

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Digite sua pergunta sobre SAP, ABAP, Fiori... (Shift+Enter para nova linha)"
                className="flex-1 resize-none bg-white min-h-[60px] max-h-[200px]"
                disabled={isLoading || isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isTyping}
                className="bg-geo-primary hover:bg-geo-primary/90 h-[60px] px-6"
              >
                {isLoading || isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de Projeto */}
      <ProjectModal
        open={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false)
          setEditingProject(null)
        }}
        onSuccess={() => {
          carregarProjetos()
        }}
        projeto={editingProject}
      />
    </motion.div>
  )
}
