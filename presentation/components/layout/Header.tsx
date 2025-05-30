"use client"

import { useEffect, useState } from "react"
import { LogOut, Package, User, Upload, Search, ArrowRightLeft, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/presentation/providers/AuthProvider"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Consultar Produtos",
    href: "/products",
    icon: Search,
    adminOnly: false
  },
  {
    title: "Importar Produtos",
    href: "/products/import",
    icon: Upload,
    adminOnly: true
  },
  {
    title: "Importar Equivalências",
    href: "/equivalences/import",
    icon: ArrowRightLeft,
    adminOnly: true
  },
]

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || user?.is_admin)

  const Navigation = () => (
    <nav className="flex items-center space-x-4">
      {filteredMenuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center space-x-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  )

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Função para verificar o tamanho da tela
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 400)
    }

    // Verifica no início
    checkScreenSize()

    // Adiciona listener para mudanças no tamanho da tela
    window.addEventListener('resize', checkScreenSize)

    // Remove o listener quando o componente desmontar
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2 px-4">
                  <Package className="h-6 w-6 text-primary" />
                  <h2 className="text-lg font-semibold">Estoque Santos Penedo e cia LTDA.</h2>
                </div>
                <nav className="flex flex-col gap-2 px-2">
                  {filteredMenuItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
                          ${isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex flex-1 items-center justify-center gap-2">
            <Package className="h-8 w-8 md:h-6 md:w-6 text-primary" />
            {!isMobile && (
            <h1 className="text-xl md:text-xl font-bold">Santos Penedo</h1>)}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-8 px-3">
                <span className="text-sm md:text-base">Olá, {user?.name}</span>
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
