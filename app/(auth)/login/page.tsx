import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Abapfy',
  description: 'Faça login na plataforma Abapfy'
}

export default function LoginPage() {
  return <LoginForm />
}