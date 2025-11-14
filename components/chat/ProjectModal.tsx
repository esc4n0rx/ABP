"use client"

import { useState, useEffect } from "react"
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
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { ChatProjeto, CORES_PROJETO } from "@/types/chat"

interface ProjectModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  projeto?: ChatProjeto | null
}

export function ProjectModal({
  open,
  onClose,
  onSuccess,
  projeto = null,
}: ProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<ChatProjeto>>({
    nome: "",
    descricao: "",
    contexto: "",
    cor: "#2b6cfd",
  })

  useEffect(() => {
    if (projeto) {
      setFormData({
        nome: projeto.nome,
        descricao: projeto.descricao || "",
        contexto: projeto.contexto || "",
        cor: projeto.cor || "#2b6cfd",
      })
    } else {
      setFormData({
        nome: "",
        descricao: "",
        contexto: "",
        cor: "#2b6cfd",
      })
    }
  }, [projeto, open])

  const handleSubmit = async () => {
    if (!formData.nome || formData.nome.trim().length === 0) {
      toast.error("Nome do projeto é obrigatório")
      return
    }

    setIsLoading(true)

    try {
      const url = projeto
        ? `/api/chat/projetos/${projeto.id}`
        : "/api/chat/projetos"
      const method = projeto ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Erro ao salvar projeto")
        return
      }

      toast.success(projeto ? "Projeto atualizado!" : "Projeto criado!")
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar projeto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {projeto ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nome do Projeto *</Label>
            <Input
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Ex: Implementação SD - Pedidos de Venda"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Breve descrição do projeto"
              rows={3}
            />
          </div>

          <div>
            <Label>Contexto do Projeto</Label>
            <Textarea
              value={formData.contexto}
              onChange={(e) =>
                setFormData({ ...formData, contexto: e.target.value })
              }
              placeholder="Contexto específico que será enviado com cada mensagem (opcional)&#10;&#10;Exemplo:&#10;- Empresa: ACME Corp&#10;- Módulo: SD&#10;- Versão SAP: S/4HANA 2022&#10;- Customizações específicas: X, Y, Z"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este contexto será incluído em todas as conversas deste projeto
            </p>
          </div>

          <div>
            <Label>Cor do Projeto</Label>
            <Select
              value={formData.cor}
              onValueChange={(value) =>
                setFormData({ ...formData, cor: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CORES_PROJETO.map((cor) => (
                  <SelectItem key={cor.value} value={cor.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: cor.value }}
                      />
                      {cor.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-geo-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>{projeto ? "Atualizar" : "Criar"} Projeto</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
