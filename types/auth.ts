export interface UserProfile {
  id: string
  name: string
  position: string
  email: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  created_at: string | number | Date
  id: string
  email: string
  profile: UserProfile | null
}

export interface RegisterData {
  name: string
  position: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}