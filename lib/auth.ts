"use client"

import { createClient } from "@/lib/supabase/client"

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export class AuthService {
  static async getCurrentUser(): Promise<User | null> {
    const supabase = createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email?.split("@")[0],
    }
  }

  static async logout(): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return !error
  }
}
