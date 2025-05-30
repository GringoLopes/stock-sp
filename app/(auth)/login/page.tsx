"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/presentation/providers/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Droplets, User, Package } from "lucide-react"

export default function LoginPage() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
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
      const success = await signIn(name.trim(), password)
      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o sistema...",
        })
        router.push("/products")
      } else {
        toast({
          title: "Erro no login",
          description: "Nome de usuário ou senha incorretos.",
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
    <div className="min-h-screen flex items-center justify-center  from-blue-50 via-gray-50 to-blue-50 bg-[url('/subtle-pattern.png')] px-4">
      <Card className="w-full max-w-md border-2 shadow-lg backdrop-blur-sm bg-white/90">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <Package className="h-16 w-16 text-blue-700" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Santos & Penedo e Cia LTDA.
            </CardTitle>
            <p className="text-sm text-blue-700 font-medium mt-1">
              Filtros • Palhetas • Óleos Lubrificantes
            </p>
          </div>
          <CardDescription className="text-gray-600">
            Acesse o sistema para consultar o estoque.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">Nome de usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome de usuário"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-700 hover:bg-blue-800 text-white transition-colors"
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
