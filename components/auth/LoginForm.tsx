// components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Loader2, Lock, Mail, LogIn } from 'lucide-react'
import Link from 'next/link'

export function LoginForm() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl" // Mantido como container externo
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-5xl font-bold text-geo-primary mb-2"
          >
            Abapfy
          </motion.h1>
          <p className="text-gray-600 text-lg">Plataforma profissional de consultoria SAP</p>
        </div>

        {/* MODIFICADO: Adicionada classe max-w-xl e mx-auto ao Card para centralizar e definir largura interna */}
        <Card className="shadow-2xl border-0 max-w-xl mx-auto"> 
          <CardHeader className="space-y-3 pb-8">
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-geo-primary to-geo-accent rounded-2xl shadow-lg">
              <LogIn className="text-white" size={36} />
            </div>
            <CardTitle className="text-3xl text-center font-bold text-gray-900">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-center text-base">
              Entre com suas credenciais para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-11 h-10 text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base font-medium">
                    Senha
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-geo-primary hover:text-geo-secondary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-11 h-10 text-base"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-base font-semibold bg-geo-primary hover:bg-geo-primary/90 shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Entrar
                  </>
                )}
              </Button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">ou</span>
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-base text-gray-600">
                  Não tem uma conta?
                </p>
                <Link
                  href="/register"
                  className="block w-full h-10 flex items-center justify-center border-2 border-geo-primary rounded-lg hover:bg-geo-primary hover:text-white transition-all font-medium text-geo-primary"
                >
                  Criar nova conta
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2025 Abapfy. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  )
}