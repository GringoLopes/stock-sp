'use client'

import type React from "react"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/src/modules/auth/presentation/providers/auth.provider"
import { QueryProvider } from "@/presentation/providers/QueryProvider"
import { Toaster } from "@/components/ui/toaster"
import { useSupabaseSession } from '@/hooks/useSupabaseSession'

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useSupabaseSession() // Mantém a sessão sincronizada

  return (
    <body className={inter.className}>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </body>
  )
} 