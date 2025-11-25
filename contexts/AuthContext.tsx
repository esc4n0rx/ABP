'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, clearSupabaseCache } from '@/lib/supabase/client'
import type { AuthUser, RegisterData, LoginData } from '@/types/auth'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (data: LoginData) => Promise<{ error?: string; success?: boolean }>
  register: (data: RegisterData) => Promise<{ error?: string; success?: boolean }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const isLoadingProfile = useRef(false)
  const loadedUserId = useRef<string | null>(null)

  const loadUserProfile = async (authUser: User) => {
    // Previne múltiplas chamadas simultâneas para o mesmo usuário
    if (isLoadingProfile.current || loadedUserId.current === authUser.id) {
      return
    }

    isLoadingProfile.current = true

    try {
      const { data: profile, error } = await Promise.race([
        supabase
          .from('users_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout ao carregar perfil')), 10000)
        )
      ])

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error)
      }

      setUser({
        id: authUser.id,
        email: authUser.email!,
        created_at: authUser.created_at,
        profile: profile || null
      })

      loadedUserId.current = authUser.id
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error)
      // Define usuário mesmo sem perfil para não travar
      setUser({
        id: authUser.id,
        email: authUser.email!,
        created_at: authUser.created_at,
        profile: null
      })
    } finally {
      isLoadingProfile.current = false
    }
  }

  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const MAX_RETRIES = 2

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout ao verificar sessão')), 8000)
          )
        ])

        if (!mounted) return

        if (error) {
          console.error('Erro ao obter sessão:', error)

          // Se for erro de sessão corrompida, limpa completamente
          if (retryCount < MAX_RETRIES) {
            retryCount++
            console.log(`Tentando limpar cache e reconectar (tentativa ${retryCount})...`)
            clearSupabaseCache()
            await supabase.auth.signOut()

            // Aguarda um pouco antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 500))
            return initializeAuth()
          }
        }

        if (session?.user) {
          await loadUserProfile(session.user)
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error)

        // Em caso de erro persistente, faz limpeza completa
        if (retryCount < MAX_RETRIES) {
          retryCount++
          console.log(`Limpando cache após erro (tentativa ${retryCount})...`)
          try {
            clearSupabaseCache()
            await supabase.auth.signOut()
            await new Promise(resolve => setTimeout(resolve, 500))
            return initializeAuth()
          } catch (cleanupError) {
            console.error('Erro ao limpar sessão:', cleanupError)
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Reseta o cache quando há mudança de usuário
      if (event === 'SIGNED_OUT') {
        loadedUserId.current = null
        setUser(null)
        setIsLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await loadUserProfile(session.user)
        }
        setIsLoading(false)
      } else if (event === 'USER_UPDATED') {
        if (session?.user) {
          await loadUserProfile(session.user)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const register = async (data: RegisterData) => {
    try {
      const { data: authData, error: signUpError } = await Promise.race([
        supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              position: data.position,
            },
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout ao criar conta')), 15000)
        )
      ])

      if (signUpError) {
        return { error: signUpError.message }
      }

      // Aguarda o perfil ser carregado antes de retornar sucesso
      if (authData?.user) {
        await loadUserProfile(authData.user)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Erro ao registrar:', error)
      return { error: error?.message || 'Erro ao criar conta. Tente novamente.' }
    }
  }

  const login = async (data: LoginData) => {
    try {
      // Limpa cache anterior para evitar conflitos
      loadedUserId.current = null

      const { data: authData, error } = await Promise.race([
        supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout ao fazer login')), 15000)
        )
      ])

      if (error) {
        // Trata erros específicos do Supabase
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Email ou senha inválidos' }
        }
        return { error: error.message }
      }

      // Aguarda o perfil ser carregado antes de retornar sucesso
      if (authData?.user) {
        await loadUserProfile(authData.user)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      return { error: error?.message || 'Erro ao fazer login. Tente novamente.' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    // Correção: Redirecionar para a raiz '/'
    router.push('/')
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
