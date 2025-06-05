"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangePasswordUseCase } from "@/src/modules/auth/application/use-cases/change-password.use-case"
import { SupabaseUserRepository } from "@/src/modules/auth/infrastructure/repositories/supabase-user.repository"
import { SessionManager } from "@/src/shared/infrastructure/session/session-manager"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const currentUser = SessionManager.getCurrentUser()
      
      if (!currentUser) {
        router.push("/login")
        return
      }

      const userRepository = new SupabaseUserRepository()
      const changePasswordUseCase = new ChangePasswordUseCase(userRepository)

      const result = await changePasswordUseCase.execute({
        userId: currentUser.id.toString(),
        currentPassword: "1234", // Senha padrão do sistema
        newPassword,
        confirmPassword,
      })

      if (result.success) {
        // Remove o cookie de must_change_password
        document.cookie = "must_change_password=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        
        // Redireciona para a página principal
        router.push("/products")
      } else {
        setError(result.error?.message || "Erro ao alterar senha")
      }
    } catch (err) {
      setError("Erro ao alterar senha. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Bem-vindo(a)! Crie sua senha</CardTitle>
          <CardDescription className="text-center">
            Por segurança, você precisa criar uma nova senha para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                  autoFocus
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Requisito da senha:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Mínimo de 6 caracteres (pode conter números e/ou letras)</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Nova Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 