"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useSidebarResponsive } from "@/hooks/use-responsive-sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_WIDTH = {
  expanded: "16rem",
  collapsed: "4rem",
  mobile: "18rem",
}

type SidebarContext = ReturnType<typeof useSidebarResponsive>

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
  }
>(({ defaultOpen = true, className, style, children, ...props }, ref) => {
  const sidebarState = useSidebarResponsive({ isOpen: defaultOpen })

  const contextValue = React.useMemo(
    () => sidebarState,
    [sidebarState]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={{
            "--sidebar-width": sidebarState.isCollapsed
              ? SIDEBAR_WIDTH.collapsed
              : SIDEBAR_WIDTH.expanded,
            "--sidebar-width-mobile": SIDEBAR_WIDTH.mobile,
            ...style,
          } as React.CSSProperties}
          className={cn(
            "group/sidebar relative flex min-h-screen w-full transition-all duration-300",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "default" | "floating" | "minimal"
  }
>(
  (
    {
      side = "left",
      variant = "default",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const {
      isMobile,
      isCollapsed,
      isMobileOpen,
      closeMobileSidebar,
      toggleSidebar,
    } = useSidebar()

    // Versão mobile do sidebar
    if (isMobile) {
      return (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 lg:hidden"
            onClick={toggleSidebar}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          
          <Sheet open={isMobileOpen} onOpenChange={closeMobileSidebar}>
            <SheetContent
              side={side}
              className={cn(
                "w-[var(--sidebar-width-mobile)] border-0 bg-sidebar p-0",
                className
              )}
            >
              {children}
            </SheetContent>
          </Sheet>
        </>
      )
    }

    // Versão desktop do sidebar
    return (
      <div
        data-side={side}
        data-variant={variant}
        ref={ref}
        {...props}
        className={cn(
          "relative flex h-screen flex-col",
          variant === "default" && "border-r bg-sidebar",
          variant === "floating" && "m-4 rounded-lg border bg-sidebar shadow-lg",
          variant === "minimal" && "bg-transparent",
          isCollapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]",
          "transition-all duration-300",
          className
        )}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

// Subcomponentes do Sidebar
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { isCollapsed } = useSidebar()
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-14 items-center px-4",
        isCollapsed ? "justify-center" : "justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 flex-col gap-2 p-2", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto flex items-center p-4", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isCollapsed } = useSidebar()
  
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "absolute -right-4 top-4 z-20 rounded-full bg-secondary",
        className
      )}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft
        className={cn(
          "h-4 w-4 transition-transform",
          isCollapsed && "rotate-180"
        )}
      />
    </Button>
  )
})
SidebarToggle.displayName = "SidebarToggle"

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarToggle,
  SidebarProvider,
  useSidebar
}
