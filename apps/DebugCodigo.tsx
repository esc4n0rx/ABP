"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Bug } from "lucide-react"

export function DebugCodigo() {
  const [code, setCode] = useState("")
  const [analysis, setAnalysis] = useState<string[]>([])

  const handleAnalyze = () => {
    if (!code.trim()) {
      toast.error("Insira um código para analisar")
      return
    }

    // Simulate analysis
    const mockIssues = [
      "Linha 3: Variável não inicializada detectada",
      "Linha 7: Possível loop infinito",
      "Linha 12: Falha de verificação de erro",
    ]
    setAnalysis(mockIssues)
    toast.success("Análise completa!")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug de Código</h1>
        <p className="text-gray-600">Analisador e debugger para código ABAP</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Código</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 bg-white text-gray-900 font-mono p-4 rounded-lg border border-gray-200 focus:border-geo-accent resize-none"
            placeholder="Cole seu código ABAP aqui..."
          />
          <Button
            onClick={handleAnalyze}
            className="w-full mt-4 bg-geo-primary hover:bg-geo-primary/90 text-white flex items-center justify-center gap-2"
          >
            <Bug size={16} /> Analisar
          </Button>
        </Card>

        {/* Analysis Results */}
        <Card className="bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Problemas Encontrados</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analysis.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhuma análise realizada ainda</p>
            ) : (
              analysis.map((issue, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  ⚠️ {issue}
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
