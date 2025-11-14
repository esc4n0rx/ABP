'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AuthUser, RegisterData, LoginData } from '@/types/auth'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (data: LoginData) => Promise<{ error?: string }>
  register: (data: RegisterData) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const loadUserProfile = async (authUser: User) => {
    const { data: profile } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    setUser({
      id: authUser.id,
      email: authUser.email!,
      profile: profile || null
    })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user)
      }
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const register = async (data: RegisterData) => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            position: data.position,
          },
        },
      })

      if (signUpError) {
        return { error: signUpError.message }
      }

      return {}
    } catch (error) {
      return { error: 'Erro ao criar conta' }
    }
  }

  const login = async (data: LoginData) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        return { error: error.message }
      }

      router.push('/dashboard')
      return {}
    } catch (error) {
      return { error: 'Erro ao fazer login' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}