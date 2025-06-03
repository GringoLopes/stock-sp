"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/src/modules/auth/presentation/providers/auth.provider"
import { Loader2, Package, User } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"

export default function LoginPage() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome de usuário e senha.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const result = await login(name.trim(), password)
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o sistema...",
        })
        router.push(result.redirectTo || "/products")
      } else {
        toast({
          title: "Erro no login",
          description: result.error || "Nome de usuário ou senha incorretos.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-2 shadow-lg backdrop-blur-sm bg-card/90">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <Package className="h-16 w-16 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Santos & Penedo e Cia LTDA.
            </CardTitle>
            <p className="text-sm text-primary font-medium mt-1">
              Filtros • Palhetas • Óleos Lubrificantes
            </p>
          </div>
          <CardDescription className="text-muted-foreground">
            Acesse o sistema para consultar o estoque.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">Nome de usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome de usuário"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 border-input focus:border-primary focus:ring-primary"
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-input focus:border-primary focus:ring-primary"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
