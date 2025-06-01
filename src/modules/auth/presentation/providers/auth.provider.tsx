"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { SupabaseUserRepository } from "../../infrastructure/repositories/supabase-user.repository"
import { CustomAuthenticationService } from "../../infrastructure/services/custom-authentication.service"
import { LoginUseCase } from "../../application/use-cases/login.use-case"
import { LogoutUseCase } from "../../application/use-cases/logout.use-case"
import { User } from "@/src/shared/domain/entities/user.entity"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (name: string, password: string) => Promise<{ success: boolean; error?: string }>
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
        const currentUser = authService.getCurrentUser()
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
        return { success: true }
      } else {
        return { success: false, error: result.error.message }
      }
    } catch (error) {
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
