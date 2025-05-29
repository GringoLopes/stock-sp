"use client"

import { Package, Search, Upload, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Consultar Produtos",
    href: "/products",
    icon: Search,
  },
  {
    title: "Importar Produtos",
    href: "/products/import",
    icon: Upload,
  },
  {
    title: "Importar Equivalências",
    href: "/equivalences/import",
    icon: ArrowRightLeft,
  },
]

interface NavigationProps {
  className?: string
  isCollapsed?: boolean
}

export function Navigation({ className, isCollapsed }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col gap-2", className)}>
      {menuItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        )
      })}
    </nav>
  )
} 