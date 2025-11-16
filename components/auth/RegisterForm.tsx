// components/auth/RegisterForm.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Loader2, User, Briefcase, Mail, Lock, UserPlus, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function RegisterForm() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await register(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl" // Mantido como container externo
        >
          {/* MODIFICADO: Adicionada classe max-w-xl e mx-auto ao Card para centralizar e definir largura interna */}
          <Card className="shadow-2xl border-0 max-w-xl mx-auto"> 
            <CardHeader className="space-y-4 pb-8">
              <div className="flex items-center justify-center w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-lg">
                <CheckCircle2 className="text-white" size={48} />
              </div>
              <CardTitle className="text-4xl text-center font-bold text-green-600">
                Cadastro realizado!
              </CardTitle>
              <CardDescription className="text-center text-lg text-gray-600">
                Verifique seu email para confirmar sua conta e começar a usar a plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 px-8">
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
                  <h4 className="font-semibold text-green-900 flex items-center gap-2 text-lg">
                    <Mail size={20} />
                    Próximos passos
                  </h4>
                  <ul className="text-base text-green-800 space-y-2 ml-6 list-disc">
                    <li>Verifique sua caixa de entrada</li>
                    <li>Clique no link de confirmação</li>
                    <li>Faça login e comece a usar</li>
                  </ul>
                </div>

                <Button
                  asChild
                  className="w-full h-10 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Link href="/login" className="flex items-center justify-center gap-2">
                    Ir para Login
                    <ArrowRight size={20} />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
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
              <UserPlus className="text-white" size={36} />
            </div>
            <CardTitle className="text-3xl text-center font-bold text-gray-900">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-center text-base">
              Preencha os dados abaixo para começar a usar a plataforma
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-medium">
                    Nome Completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="name"
                      type="text"
                      placeholder="João Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-11 h-10 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="position" className="text-base font-medium">
                    Cargo
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="position"
                      type="text"
                      placeholder="Consultor SAP"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="pl-11 h-10 text-base"
                      required
                    />
                  </div>
                </div>
              </div>

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
                <Label htmlFor="password" className="text-base font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-11 h-10 text-base"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-sm text-gray-500 flex items-start gap-1">
                  <Lock size={14} className="mt-0.5 flex-shrink-0" />
                  Use uma senha forte com pelo menos 6 caracteres
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-base font-semibold bg-geo-primary hover:bg-geo-primary/90 shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Criar Conta
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
                  Já tem uma conta?
                </p>
                <Link
                  href="/login"
                  className="block w-full h-10 flex items-center justify-center border-2 border-geo-primary rounded-lg hover:bg-geo-primary hover:text-white transition-all font-medium text-geo-primary"
                >
                  Fazer login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2024 Abapfy. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  )
}