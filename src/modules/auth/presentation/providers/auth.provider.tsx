"use client"

import type React from "react"

import { User } from "@/src/shared/domain/entities/user.entity"
import { SessionManager } from "@/src/shared/infrastructure/session/session-manager"
import { createContext, useContext, useEffect, useState } from "react"
import { LoginUseCase } from "../../application/use-cases/login.use-case"
import { LogoutUseCase } from "../../application/use-cases/logout.use-case"
import { SupabaseUserRepository } from "../../infrastructure/repositories/supabase-user.repository"
import { CustomAuthenticationService } from "../../infrastructure/services/custom-authentication.service"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (name: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Dependencies
  const userRepository = new SupabaseUserRepository()
  const authService = new CustomAuthenticationService(userRepository)
  const loginUseCase = new LoginUseCase(userRepository)
  const logoutUseCase = new LogoutUseCase()

  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Tenta recuperar o usuário da sessão
        const currentUser = SessionManager.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (name: string, password: string) => {
    try {
      const result = await loginUseCase.execute({ name, password })

      if (result.success) {
        setUser(result.data.user)
        
        // Se o usuário precisa trocar a senha, define o cookie
        if (result.data.requirePasswordChange) {
          document.cookie = "must_change_password=true; path=/"
        }
        
        return { 
          success: true, 
          redirectTo: result.data.redirectTo 
        }
      } else {
        return { success: false, error: result.error.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro inesperado",
      }
    }
  }

  const logout = async () => {
    try {
      await logoutUseCase.execute({})
      setUser(null)
      SessionManager.clearSession()
      // Remove o cookie ao fazer logout
      document.cookie = "must_change_password=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
