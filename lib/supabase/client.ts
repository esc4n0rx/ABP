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
    // REMOVIDO: Configuração manual de auth/storage. 
    // Agora usamos o padrão (Cookies) para que o Server Component consiga ler a sessão.
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
    // Remove possíveis chaves antigas do localStorage para evitar conflitos
    const keysToRemove = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key?.startsWith('supabase')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => window.localStorage.removeItem(key))
    
    // Limpa cookies do Supabase também (padrão sb-*-auth-token)
    document.cookie.split(";").forEach((c) => {
      if(c.trim().startsWith("sb-")) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
    });
  }
  clientInstance = null
}
