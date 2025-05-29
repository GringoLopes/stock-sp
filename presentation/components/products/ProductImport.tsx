"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImportResult {
  total: number
  success: number
  errors: string[]
}

export function ProductImport() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setResult(null)
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive",
      })
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
      const row: any = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })

      return row
    })
  }

  const validateRow = (row: any, index: number): string | null => {
    if (!row.product || row.product.trim() === "") {
      return `Linha ${index + 2}: Nome do produto é obrigatório`
    }

    if (row.price) {
      const price = Number.parseFloat(row.price)
      if (isNaN(price)) {
        return `Linha ${index + 2}: Preço deve ser um número válido`
      }
      if (price > 99999999.99) {
        return `Linha ${index + 2}: Preço não pode exceder R$ 99.999.999,99`
      }
    }

    if (row.stock) {
      const stock = Number.parseInt(row.stock)
      if (isNaN(stock)) {
        return `Linha ${index + 2}: Estoque deve ser um número inteiro válido`
      }
      if (stock > 2147483647) {
        return `Linha ${index + 2}: Estoque não pode exceder 2.147.483.647`
      }
    }

    return null
  }

  const importProducts = async () => {
    if (!file) return

    setImporting(true)
    setProgress(0)
    setResult(null)

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      const errors: string[] = []
      const validRows: any[] = []

      // Validar dados
      rows.forEach((row, index) => {
        const error = validateRow(row, index)
        if (error) {
          errors.push(error)
        } else {
          validRows.push({
            product: row.product.trim(),
            stock: Math.min(Number.parseInt(row.stock) || 0, 2147483647),
            price: Math.min(Number.parseFloat(row.price) || 0.0, 99999999.99),
            application: row.application?.trim() || null,
          })
        }
      })

      if (errors.length > 0 && validRows.length === 0) {
        setResult({ total: rows.length, success: 0, errors })
        return
      }

      // Importar em lotes de 100
      const batchSize = 100
      let successCount = 0

      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize)

        try {
          const response = await fetch("/api/products/import", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ products: batch }),
          })

          if (response.ok) {
            const result = await response.json()
            successCount += result.count || batch.length
          } else {
            const errorData = await response.json()
            errors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${errorData.error}`)
          }
        } catch (error) {
          errors.push(`Lote ${Math.floor(i / batchSize) + 1}: Erro de conexão`)
        }

        setProgress(Math.round(((i + batchSize) / validRows.length) * 100))
      }

      setResult({
        total: rows.length,
        success: successCount,
        errors,
      })

      toast({
        title: "Importação concluída",
        description: `${successCount} produtos importados com sucesso.`,
      })
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Erro ao processar o arquivo CSV.",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }

  const downloadTemplate = () => {
    const template = `product,stock,price,application
"Exemplo Produto 1",10,25.50,"Aplicação exemplo 1"
"Exemplo Produto 2",5,45.00,"Aplicação exemplo 2"`

    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template-produtos.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Produtos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Importe produtos a partir de um arquivo CSV</p>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Baixar Template
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-file">Arquivo CSV</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            ref={fileInputRef}
            disabled={importing}
          />
          <p className="text-xs text-gray-500">Formato esperado: product, stock, price, application</p>
        </div>

        {file && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </AlertDescription>
          </Alert>
        )}

        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importando produtos...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {result && (
          <Alert className={result.errors.length > 0 ? "border-yellow-500" : "border-green-500"}>
            {result.errors.length > 0 ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Total de linhas:</strong> {result.total} <br />
                  <strong>Importados com sucesso:</strong> {result.success} <br />
                  <strong>Erros:</strong> {result.errors.length}
                </p>
                {result.errors.length > 0 && (
                  <details>
                    <summary className="cursor-pointer">Ver erros</summary>
                    <ul className="mt-2 space-y-1 text-sm">
                      {result.errors.slice(0, 10).map((error, index) => (
                        <li key={index} className="text-red-600">
                          • {error}
                        </li>
                      ))}
                      {result.errors.length > 10 && (
                        <li className="text-gray-500">... e mais {result.errors.length - 10} erros</li>
                      )}
                    </ul>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={importProducts} disabled={!file || importing} className="flex-1">
            {importing ? "Importando..." : "Importar Produtos"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFile(null)
              setResult(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
            disabled={importing}
          >
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
