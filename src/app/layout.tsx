// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "@/app/client-layout"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter', // Adicione esta linha
  display: 'swap' // Adicione esta linha também
})

export const metadata: Metadata = {
  title: "Santos & Penedo e Cia LTDA",
  description: "Sistema de gestão de estoque - Filtros, Palhetas e Óleos Lubrificantes",
  keywords: ["estoque", "produtos", "inventário", "gestão"],
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans`}> 
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}