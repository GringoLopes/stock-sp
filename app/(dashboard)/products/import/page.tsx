"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EquivalenceCSVImport } from "@/presentation/components/products/EquivalenceCSVImport"
import { ProductCSVImport } from "@/presentation/components/products/ProductCSVImport"
import { useAuth } from "@/src/modules/auth/presentation/providers/auth.provider"
import { ArrowRightLeft, FileText, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ImportPage() {
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
        <h1 className="text-3xl font-bold">Importar Dados</h1>
        <p className="text-gray-600 mt-2">Importe produtos e equivalências em massa usando diferentes formatos</p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Para importar mais de 10.000 registros, recomendamos usar a importação CSV com
          ponto e vírgula ou executar diretamente no painel do Supabase para melhor performance.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="csv-semicolon" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv-semicolon" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Produtos CSV (;)
          </TabsTrigger>          
          <TabsTrigger value="equivalences" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Equivalências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv-semicolon" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importação de Produtos</CardTitle>
              <CardDescription>
                Ideal para arquivos no formato brasileiro com separador ponto e vírgula (;). Recomendado para grandes
                volumes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductCSVImport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importação CSV Tradicional</CardTitle>
              <CardDescription>
                Para arquivos CSV com separador vírgula (,). Ideal para importações de até 1.000 produtos.
              </CardDescription>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        </TabsContent>  

        <TabsContent value="equivalences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importação de Equivalências</CardTitle>
              <CardDescription>
                Ideal para arquivos no formato brasileiro com separador ponto e vírgula (;). Recomendado para grandes volumes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EquivalenceCSVImport />
            </CardContent>
          </Card>          
        </TabsContent>
      </Tabs>
    </div>
  )
}
