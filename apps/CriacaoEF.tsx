"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  FileText,
  Plus,
  TrendingUp,
  Clock,
  BarChart3,
  Sparkles,
} from "lucide-react"
import { EFModal } from "@/components/ef/EFModal"
import { EFStats } from "@/types/ef"

export function CriacaoEF() {
  const [modalOpen, setModalOpen] = useState(false)
  const [stats, setStats] = useState<EFStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const carregarEstatisticas = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch("/api/ef/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleSuccess = () => {
    carregarEstatisticas()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Especificações Funcionais
          </h1>
          <p className="text-gray-600">
            Crie e gerencie suas Especificações Funcionais SAP com IA
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-geo-primary hover:bg-geo-primary/90 text-white flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova EF
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">
                  Total de EFs
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {isLoadingStats ? "-" : stats?.total_efs || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">
                  Publicadas
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {isLoadingStats ? "-" : stats?.efs_publicadas || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">
                  Recentes (7 dias)
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {isLoadingStats ? "-" : stats?.efs_recentes || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium mb-1">
                  Refinadas
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {isLoadingStats ? "-" : stats?.efs_refinadas || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* CTA Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-8 bg-gradient-to-br from-geo-primary/10 via-geo-secondary/10 to-geo-accent/10 border-geo-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-geo-primary" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Crie sua Especificação Funcional com IA
                </h3>
              </div>
              <p className="text-gray-700 mb-4">
                Nossa inteligência artificial refinará e organizará todo o conteúdo
                da sua EF, criando um documento profissional e bem estruturado em
                minutos.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-geo-primary rounded-full" />
                  <span>Refinamento automático</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-geo-secondary rounded-full" />
                  <span>Organização profissional</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-geo-accent rounded-full" />
                  <span>Download em DOCX</span>
                </div>
              </div>
            </div>
            <div>
              <Button
                onClick={() => setModalOpen(true)}
                size="lg"
                className="bg-geo-primary hover:bg-geo-primary/90 text-white h-14 px-8 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Nova EF
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Informações sobre o processo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Como funciona?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-geo-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Preencha os dados
                </h4>
                <p className="text-sm text-gray-600">
                  Forneça as informações básicas, especificação técnica, equipe e
                  recursos necessários.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-geo-secondary text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  IA refina o conteúdo
                </h4>
                <p className="text-sm text-gray-600">
                  Nossa IA organiza, estrutura e aprimora todo o conteúdo de forma
                  profissional.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-geo-accent text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Baixe e salve
                </h4>
                <p className="text-sm text-gray-600">
                  Revise o resultado, baixe em DOCX e salve no banco de dados para
                  consulta futura.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Modal */}
      <EFModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </motion.div>
  )
}
