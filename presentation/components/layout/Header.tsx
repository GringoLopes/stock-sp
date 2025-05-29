"use client"

import { LogOut, Package, User, Upload, Search, ArrowRightLeft } from "lucide-react"
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

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Sistema de Estoque</h1>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/products">
            <Button variant={pathname === "/products" ? "default" : "ghost"} size="sm">
              <Search className="h-4 w-4 mr-2" />
              Consultar Produtos
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={pathname.includes("/import") ? "default" : "outline"} size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Importação de Dados</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/products/import">
                  <Package className="h-4 w-4 mr-2" />
                  Importar Produtos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/equivalences/import">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Importar Equivalências
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Olá, {user?.name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
