"use client"

import type React from "react"

import { useAuth } from "@/src/modules/auth/presentation/providers/auth.provider"
import { LoadingSpinner } from "@/src/shared/presentation/components/ui/loading-spinner"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Se estiver na página de troca de senha, verifica se o cookie existe
    const isChangePasswordPage = pathname === "/change-password"
    const mustChangePassword = document.cookie.includes("must_change_password=true")

    if (!loading) {
      // Se não estiver autenticado, deixa renderizar (login)
      if (!user) {
        return
      }

      // Se estiver na página de troca de senha e precisar trocar, deixa renderizar
      if (isChangePasswordPage && mustChangePassword) {
        return
      }

      // Se estiver autenticado e não precisar trocar senha, redireciona para products
      router.push("/products")
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Se estiver na página de troca de senha e precisar trocar, renderiza
  const isChangePasswordPage = pathname === "/change-password"
  const mustChangePassword = document.cookie.includes("must_change_password=true")
  if (user && isChangePasswordPage && mustChangePassword) {
    return <>{children}</>
  }

  // Se não estiver autenticado, renderiza (login)
  if (!user) {
    return <>{children}</>
  }

  return null
}
