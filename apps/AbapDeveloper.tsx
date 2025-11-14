"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Copy, Download } from "lucide-react"

export function AbapDeveloper() {
  const [code, setCode] = useState(`REPORT Z_HELLO_WORLD.

DATA: lv_message TYPE string.

lv_message = 'Hello, ABAP World!'.

WRITE: / lv_message.`)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    toast.success("Código copiado para a área de transferência!")
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(code))
    element.setAttribute("download", "code.abap")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Arquivo baixado!")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ABAP Developer</h1>
        <p className="text-gray-600">Editor de código ABAP com syntax highlighting</p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-geo-primary hover:bg-geo-primary/90 text-white"
            >
              <Copy size={16} /> Copiar
            </Button>
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-geo-secondary hover:bg-geo-secondary/90 text-white"
            >
              <Download size={16} /> Baixar
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 overflow-x-auto border border-gray-200">
            <div className="space-y-1">
              {code.split("\n").map((line, i) => (
                <div key={i} className="flex">
                  <span className="text-gray-400 mr-4 select-none">{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-48 bg-white text-gray-900 font-mono p-4 rounded-lg border border-gray-200 focus:border-geo-accent focus:ring-1 focus:ring-geo-accent resize-none"
            placeholder="Digite seu código ABAP aqui..."
          />
        </div>
      </Card>
    </motion.div>
  )
}
