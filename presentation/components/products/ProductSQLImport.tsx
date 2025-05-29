"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Play, AlertCircle, CheckCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImportResult {
  success: boolean
  message: string
  count?: number
  totalProcessed?: number
  parseErrors?: number
  insertErrors?: number
  details?: {
    parseErrors?: string[]
    insertErrors?: string[]
  }
}

export function ProductSQLImport() {
  const [sqlQuery, setSqlQuery] = useState("")
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const { toast } = useToast()

  const exampleSQL = `INSERT INTO products (product, stock, price, application) VALUES
('06211700 (KR27004)', 0, 0.00, NULL),
('06211718 (KR20014)', 0, 0.00, NULL),
('0986B01907', 0, 0.00, NULL),
('0986B03511 CA4202', 0, 48.50, NULL),
('0986B03526', 3, 0.00, 'AGRALE - 1800 - MWM D 229/4 // 88 -- 96');`

  const executeSQL = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "SQL vazio",
        description: "Por favor, insira um comando SQL válido.",
        variant: "destructive",
      })
      return
    }

    setExecuting(true)
    setResult(null)

    try {
      const response = await fetch("/api/products/sql-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: sqlQuery }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast({
          title: "SQL executado com sucesso",
          description: data.message,
        })
      } else {
        setResult({
          success: false,
          message: data.error,
          details: data.details,
        })
        toast({
          title: "Erro na execução",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = "Erro de conexão com o servidor"
      setResult({
        success: false,
        message: errorMessage,
      })
      toast({
        title: "Erro de conexão",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setExecuting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Importação via SQL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Limites importantes:</strong>
            <br />• Preço máximo: R$ 99.999.999,99 (DECIMAL 10,2)
            <br />• Estoque máximo: 2.147.483.647 (INTEGER)
            <br />• Valores inválidos serão automaticamente ajustados
          </AlertDescription>
        </Alert>

        <p className="text-sm text-gray-600">
          Execute comandos SQL INSERT diretamente no banco de dados. Ideal para importações grandes.
        </p>

        <div className="space-y-2">
          <Label htmlFor="sql-query">Comando SQL</Label>
          <Textarea
            id="sql-query"
            placeholder="INSERT INTO products (product, stock, price, application) VALUES ..."
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            disabled={executing}
          />
          <p className="text-xs text-gray-500">
            Use apenas comandos INSERT. Outros comandos serão rejeitados por segurança.
          </p>
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Ver exemplo de SQL</summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">{exampleSQL}</pre>
        </details>

        {result && (
          <Alert className={result.success ? "border-green-500" : "border-red-500"}>
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>
              <div className="space-y-2">
                <p>{result.message}</p>

                {result.count !== undefined && (
                  <p className="text-sm">
                    <strong>Produtos inseridos:</strong> {result.count}
                    {result.totalProcessed && ` de ${result.totalProcessed} processados`}
                  </p>
                )}

                {(result.parseErrors || result.insertErrors) && (
                  <div className="text-sm">
                    {result.parseErrors > 0 && (
                      <p className="text-yellow-600">
                        <strong>Erros de parsing:</strong> {result.parseErrors}
                      </p>
                    )}
                    {result.insertErrors > 0 && (
                      <p className="text-red-600">
                        <strong>Erros de inserção:</strong> {result.insertErrors}
                      </p>
                    )}
                  </div>
                )}

                {result.details && (
                  <details className="text-sm">
                    <summary className="cursor-pointer">Ver detalhes dos erros</summary>
                    <div className="mt-2 space-y-2">
                      {result.details.parseErrors && result.details.parseErrors.length > 0 && (
                        <div>
                          <strong>Erros de parsing:</strong>
                          <ul className="list-disc list-inside text-xs text-yellow-700">
                            {result.details.parseErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.details.insertErrors && result.details.insertErrors.length > 0 && (
                        <div>
                          <strong>Erros de inserção:</strong>
                          <ul className="list-disc list-inside text-xs text-red-700">
                            {result.details.insertErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={executeSQL} disabled={!sqlQuery.trim() || executing} className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            {executing ? "Executando..." : "Executar SQL"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSqlQuery("")
              setResult(null)
            }}
            disabled={executing}
          >
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
