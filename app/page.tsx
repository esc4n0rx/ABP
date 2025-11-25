'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    position: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem');
          return;
        }

        if (formData.password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          return;
        }

        const result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          position: formData.position
        });

        if (result.error) {
          setError(result.error);
        } else if (result.success) {
          router.refresh(); 
          router.push('/dashboard');
        }
      } else {
        const result = await login({
          email: formData.email,
          password: formData.password
        });

        if (result.error) {
          setError(result.error);
        } else if (result.success) {
          router.refresh();
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      setError(error?.message || 'Ocorreu um erro. Tente novamente.');
      console.error('Erro no formulário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4">
              <img
                src="/icon-light-32x32.png"
                alt="Abapfy logo"
                className="w-18 h-18"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isRegisterMode ? 'Criar Conta' : 'Bem-vindo ao Abapfy'}
            </h1>
            <p className="text-gray-600">
              {isRegisterMode 
                ? 'Preencha os dados para criar sua conta' 
                : 'Entre com suas credenciais para continuar'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <Alert variant="destructive">
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegisterMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    name="position"
                    type="text"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {isRegisterMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processando...' : (isRegisterMode ? 'Criar Conta' : 'Entrar')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
                setFormData({
                  email: '',
                  password: '',
                  name: '',
                  position: '',
                  confirmPassword: ''
                });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              {isRegisterMode 
                ? 'Já tem uma conta? Fazer login' 
                : 'Não tem conta? Criar nova conta'
              }
            </button>
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm mt-8">
          © {new Date().getFullYear()} Abapfy. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
}
