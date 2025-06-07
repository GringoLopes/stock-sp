import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from "./client-layout"

export const metadata: Metadata = {
  title: "Santos & Penedo e Cia LTDA",
  description: "Sistema de gestão de estoque - Filtros, Palhetas e Óleos Lubrificantes",
  icons: {
    icon: [
      {
        url: '/icon.png',
        type: 'image/png',
      }
    ],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
