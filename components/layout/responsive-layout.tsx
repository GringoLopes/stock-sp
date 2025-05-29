"use client"

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarToggle
} from '@/components/ui/sidebar'

interface ResponsiveLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  className?: string
}

export function ResponsiveLayout({
  children,
  sidebar,
  header,
  footer,
  className
}: ResponsiveLayoutProps) {
  return (
    <SidebarProvider>
      <div className={cn("flex min-h-screen bg-background", className)}>
        {/* Sidebar */}
        {sidebar && (
          <Sidebar>
            {header && <SidebarHeader>{header}</SidebarHeader>}
            <SidebarContent>{sidebar}</SidebarContent>
            {footer && <SidebarFooter>{footer}</SidebarFooter>}
            <SidebarToggle />
          </Sidebar>
        )}

        {/* Conteúdo Principal */}
        <main className="container-responsive flex-1">
          <div className="flex min-h-screen flex-col">
            {/* Conteúdo */}
            <div className="flex-1 space-y-4 p-4 pt-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
} 