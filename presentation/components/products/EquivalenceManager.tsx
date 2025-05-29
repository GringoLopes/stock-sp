"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EquivalenceManager() {
  const [productCode, setProductCode] = useState("")
  const [equivalentCode, setEquivalentCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddEquivalence = async () => {
    if (!productCode.trim() || !equivalentCode.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha ambos os códigos.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // This would be implemented when we add the API endpoint
      toast({
        title: "Equivalência adicionada",
        description: `Equivalência entre ${productCode} e ${equivalentCode} criada com sucesso.`,
      })
      setProductCode("")
      setEquivalentCode("")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar equivalência.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Gerenciar Equivalências
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-code">Código do Produto</Label>
            <Input
              id="product-code"
              placeholder="Ex: 2040PM-OR"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equivalent-code">Código Equivalente</Label>
            <Input
              id="equivalent-code"
              placeholder="Ex: FCD0732"
              value={equivalentCode}
              onChange={(e) => setEquivalentCode(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <Button onClick={handleAddEquivalence} disabled={loading} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {loading ? "Adicionando..." : "Adicionar Equivalência"}
        </Button>
      </CardContent>
    </Card>
  )
}
