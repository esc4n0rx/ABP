// Tipo do perfil do usuário
export interface UserProfile {
  id: string
  name: string | null
  phone: string | null
  role: string | null
  department: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Request para atualizar perfil
export interface UpdateProfileRequest {
  name?: string
  phone?: string
  role?: string
  department?: string
  bio?: string
  avatar_url?: string
}

// Response da API de perfil
export interface ProfileResponse {
  success: boolean
  data?: UserProfile
  message?: string
  error?: string
}
