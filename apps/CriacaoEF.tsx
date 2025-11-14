"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Zap } from "lucide-react"

export function CriacaoEF() {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    modulo: "SD",
    autor: "",
  })
  const [generated, setGenerated] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerate = () => {
    if (!formData.nome || !formData.descricao) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }
    setGenerated(true)
    toast.success("EF criada com sucesso!")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Criação de EF</h1>
        <p className="text-gray-600">Ferramenta para criar Estruturas de Função</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurar EF</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Nome da EF</label>
              <Input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Z_SALES_ORDER_PROCESS"
                className="bg-white border border-gray-300 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Descrição</label>
              <Input
                type="text"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descrição da estrutura de função"
                className="bg-white border border-gray-300 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Módulo</label>
              <select
                name="modulo"
                value={formData.modulo}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 p-2 rounded-lg"
              >
                <option>SD</option>
                <option>MM</option>
                <option>FI</option>
                <option>HR</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Autor</label>
              <Input
                type="text"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                placeholder="Seu nome"
                className="bg-white border border-gray-300 text-gray-900"
              />
            </div>
            <Button
              type="button"
              onClick={handleGenerate}
              className="w-full bg-geo-primary hover:bg-geo-primary/90 text-white flex items-center justify-center gap-2 mt-6"
            >
              <Zap size={16} /> Gerar EF
            </Button>
          </form>
        </Card>

        {/* Preview */}
        {generated && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card className="bg-white border border-geo-accent/30 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-geo-accent mb-4">EF Gerada</h2>
              <div className="space-y-3 text-gray-600">
                <div>
                  <p className="text-geo-accent font-mono text-sm">Nome:</p>
                  <p className="text-gray-900 font-mono">{formData.nome}</p>
                </div>
                <div>
                  <p className="text-geo-accent font-mono text-sm">Descrição:</p>
                  <p className="text-gray-900 font-mono">{formData.descricao}</p>
                </div>
                <div>
                  <p className="text-geo-accent font-mono text-sm">Módulo:</p>
                  <p className="text-gray-900 font-mono">{formData.modulo}</p>
                </div>
                <div>
                  <p className="text-geo-accent font-mono text-sm">Status:</p>
                  <p className="text-geo-secondary font-mono">✓ Pronta para uso</p>
                </div>
              </div>
              <Button className="w-full mt-6 bg-geo-secondary hover:bg-geo-secondary/90 text-white">Exportar EF</Button>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
