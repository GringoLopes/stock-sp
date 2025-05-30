"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/presentation/providers/AuthProvider"
import { EquivalenceImport } from "@/presentation/components/equivalences/EquivalenceImport"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function ImportEquivalencesPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user?.is_admin) {
      router.push("/products")
    }
  }, [user, router])

  if (!user?.is_admin) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Importar Equivalências</h1>
        <p className="text-gray-600 mt-2">Importe relações de equivalência entre produtos</p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> As equivalências permitem que ao buscar por um código, o sistema encontre também
          seus códigos equivalentes. Cada linha deve conter um par de códigos separados por ponto e vírgula (;).
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Importação de Equivalências</CardTitle>
            <CardDescription>
              Importe relações de equivalência entre produtos usando um arquivo CSV ou colando diretamente os dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EquivalenceImport />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
