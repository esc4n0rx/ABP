import { createBrowserClient } from '@supabase/ssr'

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Reutiliza a mesma instância para evitar múltiplos clientes
  if (clientInstance) {
    return clientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Garante persistência consistente
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Reduz problemas de race condition em múltiplas abas
      flowType: 'pkce',
    },
    // Melhora resiliência de rede
    global: {
      headers: {
        'x-client-info': 'supabase-js-web',
      },
    },
  })

  return clientInstance
}

// Função auxiliar para limpar cache quando necessário
export function clearSupabaseCache() {
  if (typeof window !== 'undefined') {
    // Remove possíveis chaves corrompidas
    const keysToRemove = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key?.startsWith('supabase')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => window.localStorage.removeItem(key))
  }
  clientInstance = null
}