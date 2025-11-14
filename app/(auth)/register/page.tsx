import { RegisterForm } from '@/components/auth/RegisterForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Criar Conta - Abapfy',
  description: 'Crie sua conta na plataforma Abapfy'
}

export default function RegisterPage() {
  return <RegisterForm />
}