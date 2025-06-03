"use client"

import { Header } from "@/presentation/components/layout/Header"
import { useAuth } from "@/src/modules/auth/presentation/providers/auth.provider"
import { SessionManager } from "@/src/shared/infrastructure/session/session-manager"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Verifica se o usuário está autenticado
    const isAuthenticated = SessionManager.isAuthenticated()
    
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }

    // Verifica se o usuário precisa trocar a senha
    const mustChangePassword = document.cookie.includes("must_change_password=true")
    if (!loading && mustChangePassword) {
      router.push("/change-password")
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Se não estiver autenticado, não renderiza nada
  if (!SessionManager.isAuthenticated()) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-1 mt-[48px]">
        <main className="container mx-auto p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
