"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Toaster, toast } from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAppStore((state) => state.setUser)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error("Preencha todos os campos")
      return
    }

    setIsLoading(true)
    // Simulate login
    setTimeout(() => {
      setUser(username)
      toast.success(`Bem-vindo(a) ao Abapfy, ${username}!`)
      setIsLoading(false)
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-geo-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-geo-secondary/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-white/95 backdrop-blur-lg border border-geo-primary/20 shadow-2xl">
          <div className="p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-geo-primary mb-2">Abapfy</h1>
              <p className="text-geo-secondary text-sm">Plataforma Profissional de Consultoria SAP</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
                <Input
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white border border-geo-primary/30 text-gray-900 placeholder:text-gray-400 focus:border-geo-accent focus:ring-1 focus:ring-geo-accent"
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border border-geo-primary/30 text-gray-900 placeholder:text-gray-400 focus:border-geo-accent focus:ring-1 focus:ring-geo-accent"
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-geo-primary hover:bg-geo-primary/90 text-white font-semibold py-2 rounded-lg transition-all duration-200 glow-accent-hover"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 pt-6 border-t border-geo-primary/20 text-center"
            >
              <p className="text-gray-500 text-xs">GeoSystem © 2025 • Todos os direitos reservados</p>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
