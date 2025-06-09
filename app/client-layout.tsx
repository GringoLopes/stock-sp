'use client'

import type React from "react"
import { AuthProvider } from "@/src/modules/auth/presentation/providers/auth.provider"
import { QueryProvider } from "@/presentation/providers/QueryProvider"
import { Toaster } from "@/components/ui/toaster"
import { useSupabaseSession } from '@/hooks/useSupabaseSession'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useSupabaseSession() // Mantém a sessão sincronizada

  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  )
} 