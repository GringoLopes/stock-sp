"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, CheckCircle, AlertCircle, Download, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImportResult {
  total: number
  success: number
  errors: string[]
  preview?: any[]
}

export function ProductCSVImport() {
  const [file, setFile] = useState<File | null>(null)
  const [textData, setTextData] = useState("")
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (
      selectedFile &&
      (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".txt"))
    ) {
      setFile(selectedFile)
      setResult(null)
      setPreview([])
      setShowPreview(false)

      // Ler o arquivo automaticamente
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setTextData(content)
        processPreview(content)
      }
      reader.readAsText(selectedFile, "utf-8")
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV ou TXT válido.",
        variant: "destructive",
      })
    }
  }

  const processPreview = (text: string) => {
    try {
      const lines = text.split("\n").filter((line) => line.trim())
      const previewData = lines.slice(0, 5).map((line, index) => {
        const parts = line.split(";")
        return {
          linha: index + 1,
          product: parts[0]?.trim() || "",
          stock: parts[1]?.trim() || "0",
          price: parts[2]?.trim() || "0",
          application: parts[3]?.trim() || "",
        }
      })
      setPreview(previewData)
    } catch (error) {
      console.error("Erro ao processar preview:", error)
    }
  }

  const parseCSVData = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim())

    return lines.map((line, index) => {
      const parts = line.split(";")

      if (parts.length < 3) {
        throw new Error(`Linha ${index + 1}: Formato inválido. Esperado: produto;estoque;preço;aplicação`)
      }

      return {
        product: parts[0]?.trim() || "",
        stock: parts[1]?.trim() || "0",
        price: parts[2]?.trim().replace(",", ".") || "0", // Converter vírgula para ponto
        application: parts[3]?.trim() || null,
      }
    })
  }

  const validateRow = (row: any, index: number): string | null => {
    if (!row.product || row.product.trim() === "") {
      return `Linha ${index + 1}: Nome do produto é obrigatório`
    }

    const price = Number.parseFloat(row.price)
    if (isNaN(price)) {
      return `Linha ${index + 1}: Preço deve ser um número válido (${row.price})`
    }
    if (price > 99999999.99) {
      return `Linha ${index + 1}: Preço não pode exceder R$ 99.999.999,99`
    }

    const stock = Number.parseInt(row.stock)
    if (isNaN(stock)) {
      return `Linha ${index + 1}: Estoque deve ser um número inteiro válido (${row.stock})`
    }
    if (stock > 2147483647) {
      return `Linha ${index + 1}: Estoque não pode exceder 2.147.483.647`
    }

    return null
  }

  const importProducts = async () => {
    if (!textData.trim()) {
      toast({
        title: "Dados vazios",
        description: "Por favor, selecione um arquivo ou cole os dados.",
        variant: "destructive",
      })
      return
    }

    setImporting(true)
    setProgress(0)
    setResult(null)

    try {
      const rows = parseCSVData(textData)
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
            application: row.application || null,
          })
        }
      })

      if (errors.length > 0 && validRows.length === 0) {
        setResult({ total: rows.length, success: 0, errors })
        return
      }

      // Importar em lotes de 500
      const batchSize = 500
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
        description: `Erro ao processar os dados: ${error}`,
        variant: "destructive",
      })
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }

  const downloadTemplate = () => {
    const template = `13E;38;48.7;Ford Ka 2002-->, Mitsubishi Pajero Sport 2007-->, Volkswagen Parati III 1999 - 2003
14E;25;52.30;Chevrolet Corsa 2002-->, Fiat Palio 2001 - 2012
15E;10;35.90;Volkswagen Gol 2008-->, Ford Fiesta 2010 - 2017`

    const blob = new Blob([template], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template-produtos.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textData)
      toast({
        title: "Copiado!",
        description: "Dados copiados para a área de transferência.",
      })
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar os dados.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Produtos (CSV com ponto e vírgula)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Formato esperado:</strong> produto;estoque;preço;aplicação
            <br />
            <strong>Exemplo:</strong> 13E;38;48.7;Ford Ka 2002--&gt;, Mitsubishi Pajero Sport 2007--&gt;
          </AlertDescription>
        </Alert>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Importe produtos no formato CSV com separador ponto e vírgula (;)</p>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Baixar Template
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-file">Arquivo CSV/TXT</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv,.txt"
            onChange={handleFileSelect}
            ref={fileInputRef}
            disabled={importing}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="text-data">Ou cole os dados diretamente:</Label>
            {textData && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            )}
          </div>
          <Textarea
            id="text-data"
            placeholder="Cole aqui os dados no formato: produto;estoque;preço;aplicação"
            value={textData}
            onChange={(e) => {
              setTextData(e.target.value)
              processPreview(e.target.value)
            }}
            className="min-h-[150px] font-mono text-sm"
            disabled={importing}
          />
          <p className="text-xs text-gray-500">Cada linha deve ter o formato: produto;estoque;preço;aplicação</p>
        </div>

        {preview.length > 0 && (
          <div className="space-y-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? "Ocultar" : "Mostrar"} Preview ({preview.length} primeiras linhas)
            </Button>

            {showPreview && (
              <div className="border rounded p-3 bg-gray-50 text-sm">
                <div className="font-semibold mb-2">Preview dos dados:</div>
                {preview.map((item, index) => (
                  <div key={index} className="mb-1 font-mono text-xs">
                    <strong>Linha {item.linha}:</strong> {item.product} | Estoque: {item.stock} | Preço: {item.price} |
                    Aplicação: {item.application || "N/A"}
                  </div>
                ))}
              </div>
            )}
          </div>
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
                    <summary className="cursor-pointer">Ver erros ({result.errors.length})</summary>
                    <ul className="mt-2 space-y-1 text-sm max-h-40 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <li key={index} className="text-red-600">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={importProducts} disabled={!textData.trim() || importing} className="flex-1">
            {importing ? "Importando..." : "Importar Produtos"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFile(null)
              setTextData("")
              setResult(null)
              setPreview([])
              setShowPreview(false)
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
