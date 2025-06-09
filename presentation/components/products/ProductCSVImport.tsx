"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, Copy, Download, FileText, Upload, X } from "lucide-react"
import { useRef, useState } from "react"

interface ImportResult {
  total: number
  success: number
  errors: string[]
  preview?: any[]
  errorDetails?: {
    invalidCodes: { line: number; code: string; original: string }[]
    otherErrors: { line: number; error: string }[]
  }
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

  // Função para tentar decodificar o arquivo em diferentes codificações
  const decodeFileContent = async (buffer: ArrayBuffer): Promise<string> => {
    try {
      // Tenta primeiro UTF-8
      const utf8Content = new TextDecoder("utf-8").decode(buffer)
      
      // Verifica se o conteúdo UTF-8 parece válido (não tem caracteres estranhos)
      if (!utf8Content.includes("")) {
        return utf8Content
      }
      
      // Se UTF-8 falhou, tenta ANSI (windows-1252)
      const ansiContent = new TextDecoder("windows-1252").decode(buffer)
      return ansiContent
    } catch (error) {
      console.error("Erro ao decodificar arquivo:", error)
      throw new Error("Não foi possível ler o arquivo. Tente converter para UTF-8.")
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      return
    }

    // Verificar extensão do arquivo
    const fileName = selectedFile.name.toLowerCase()
    const isValidExtension = fileName.endsWith('.txt') || fileName.endsWith('.csv')

    if (!isValidExtension) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo com extensão .CSV ou .TXT",
        variant: "destructive",
      })
      return
    }

    // Aumentando o limite para 50MB
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo não pode ser maior que 50MB.",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setResult(null)
    setPreview([])
    setShowPreview(false)

    try {
      const buffer = await selectedFile.arrayBuffer()
      const content = await decodeFileContent(buffer)

      // Verificar se o conteúdo está vazio
      if (!content.trim()) {
        toast({
          title: "Arquivo vazio",
          description: "O arquivo selecionado está vazio.",
          variant: "destructive",
        })
        return
      }

      // Verificar se tem o formato esperado (pelo menos uma linha com separadores)
      const firstLine = content.split("\n")[0]
      if (!firstLine.includes(";") && !firstLine.includes(",")) {
        toast({
          title: "Formato inválido",
          description: "O arquivo deve conter dados separados por vírgula ou ponto e vírgula.",
          variant: "destructive",
        })
        return
      }

      const lines = content.split("\n").filter(line => line.trim())

      // Processar apenas as primeiras linhas para preview
      setTextData(content)
      processPreview(content)

      toast({
        title: "Arquivo carregado com sucesso",
        description: `Total de ${lines.length.toLocaleString()} linhas encontradas.`,
      })
    } catch (error) {
      console.error("Erro ao processar arquivo:", error)
      toast({
        title: "Erro na leitura",
        description: error instanceof Error ? error.message : "Erro ao ler o arquivo.",
        variant: "destructive",
      })
    }
  }

  const processPreview = (text: string) => {
    try {
      const lines = text.split("\n").filter((line) => line.trim())
      
      const previewData = lines.slice(0, 10).map((line, index) => { // Aumentando para 10 linhas no preview
        const parts = line.split(detectSeparator(text))
        
        // Limpar e processar o código do produto
        const productCode = parts[0]?.trim().replace(/"/g, "")
        const cleanProductCode = productCode
          .replace(/\s*\([^)]*\)/g, "") // Remove parênteses e seu conteúdo
          .replace(/\s+.*$/, "") // Remove tudo após o primeiro espaço
          .replace(/\.$/, "") // Remove ponto final se existir

        return {
          linha: index + 1,
          product: productCode || "",
          stock: parts[1]?.trim().replace(/"/g, "") || "0",
          price: parts[2]?.trim().replace(/"/g, "").replace(",", ".").replace(/;$/, "") || "0", // Remove ; do final
          application: parts[3]?.trim().replace(/"/g, "") || "",
          cleanCode: cleanProductCode
        }
      })
      setPreview(previewData)
    } catch (error) {
      console.error("Erro ao processar preview:", error)
    }
  }

  const detectSeparator = (text: string): ";" | "," => {
    const firstLine = text.split("\n")[0] || ""
    const semicolonCount = (firstLine.match(/;/g) || []).length
    const commaCount = (firstLine.match(/,/g) || []).length
    
    return semicolonCount >= commaCount ? ";" : ","
  }

  const parseCSVData = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    const actualSeparator = detectSeparator(text)
    
    return lines.map((line, index) => {
      const parts = line.split(actualSeparator)
      
      // Limpar e processar o código do produto
      const productCode = parts[0]?.trim().replace(/"/g, "") || ""
      const cleanProductCode = productCode
        .replace(/\s*\([^)]*\)/g, "") // Remove parênteses e seu conteúdo
        .replace(/\s+.*$/, "") // Remove tudo após o primeiro espaço
        .replace(/\.$/, "") // Remove ponto final se existir

      // Processar preço: remover ponto e vírgula do final e converter
      const price = parts[2]?.trim().replace(/"/g, "").replace(",", ".").replace(/;$/, "") || "0"

      return {
        product: productCode,
        stock: parts[1]?.trim().replace(/"/g, "") || "0",
        price: price,
        application: parts[3]?.trim().replace(/"/g, "") || "",
        cleanCode: cleanProductCode
      }
    })
  }

  const validateRow = (row: any, index: number): string | null => {
    // Validar produto
    if (!row.product || row.product.trim() === "") {
      return `Linha ${index + 1}: Nome do produto é obrigatório`
    }

    if (row.product.length > 255) {
      return `Linha ${index + 1}: Nome do produto não pode exceder 255 caracteres`
    }   

    // Validar preço
    const price = Number.parseFloat(row.price)
    if (isNaN(price)) {
      return `Linha ${index + 1}: Preço deve ser um número válido (${row.price})`
    }
    if (price < 0) {
      return `Linha ${index + 1}: Preço não pode ser negativo`
    }
    if (price > 99999999.99) {
      return `Linha ${index + 1}: Preço não pode exceder R$ 99.999.999,99`
    }

    // Validar estoque
    const stock = Number.parseInt(row.stock)
    if (isNaN(stock)) {
      return `Linha ${index + 1}: Estoque deve ser um número inteiro válido (${row.stock})`
    }
    if (stock < 0) {
      return `Linha ${index + 1}: Estoque não pode ser negativo`
    }
    if (stock > 2147483647) {
      return `Linha ${index + 1}: Estoque não pode exceder 2.147.483.647`
    }

    // Validar aplicação (opcional)
    if (row.application && row.application.length > 1000) {
      return `Linha ${index + 1}: Aplicação não pode exceder 1000 caracteres`
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
      let processedCount = 0
      const errorDetails = {
        invalidCodes: [] as { line: number; code: string; original: string }[],
        otherErrors: [] as { line: number; error: string }[]
      }

      // Validar dados
      for (const row of rows) {
        const error = validateRow(row, processedCount)
        if (error) {
          errors.push(error)
          if (error.includes("caracteres inválidos")) {
            errorDetails.invalidCodes.push({
              line: processedCount + 1,
              code: row.cleanCode,
              original: row.product
            })
          } else {
            errorDetails.otherErrors.push({
              line: processedCount + 1,
              error: error
            })
          }
        } else {
          validRows.push({
            product: row.product.trim(),
            stock: Math.min(Number.parseInt(row.stock) || 0, 2147483647),
            price: Math.min(Number.parseFloat(row.price) || 0.0, 99999999.99),
            application: row.application || null,
          })
        }
        processedCount++
        
        if (processedCount % 100 === 0) {
          setProgress(Math.round((processedCount / rows.length) * 50))
        }
      }

      if (errors.length > 0 && validRows.length === 0) {
        setResult({ total: rows.length, success: 0, errors, errorDetails })
        return
      }

      // Importar em lotes maiores para arquivos grandes
      const batchSize = 1000 // Aumentando o tamanho do lote
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

        // Atualizar progresso da importação (50-100%)
        setProgress(50 + Math.round(((i + batchSize) / validRows.length) * 50))
      }

      setResult({
        total: rows.length,
        success: successCount,
        errors,
        errorDetails
      })

      toast({
        title: "Importação concluída",
        description: `${successCount.toLocaleString()} produtos importados com sucesso.`,
      })
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: `Erro ao processar os dados: ${error}`,
        variant: "destructive",
      })
    } finally {
      setImporting(false)
      setProgress(100)
    }
  }

  const downloadTemplate = () => {
    const actualSeparator = textData ? detectSeparator(textData) : ";" as const
    const templates = {
      ";": `011338 ENCOMENDA PEDRACON;0;231;
06211700 (KR27004);0;0;
06211718 (KR20014);0;0;
0986B01907;0;0;`,
      ",": `"011338 ENCOMENDA PEDRACON",0,231,
"06211700 (KR27004)",0,0,
"06211718 (KR20014)",0,0,
"0986B01907",0,0,`
    } as const

    const template = templates[actualSeparator]
    const extension = actualSeparator === "," ? "csv" : "txt"
    const mimeType = actualSeparator === "," ? "text/csv" : "text/plain"

    const blob = new Blob([template], { type: `${mimeType};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `template-produtos.${extension}`
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
          Importar Produtos
        </CardTitle>
        <CardDescription>
          Importe produtos em massa usando arquivos CSV ou TXT. Suporta arquivos grandes e diferentes formatos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">    
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Importe produtos no formato CSV/TXT</p>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Baixar Template
          </Button>
        </div>

        <div>
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

        {preview.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? "Ocultar" : "Mostrar"} Preview ({preview.length} primeiras linhas)
              </Button>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Dados
              </Button>
            </div>

            {showPreview && (
              <div className="border rounded p-3 bg-gray-50 text-sm">
                <div className="font-semibold mb-2">
                  <span>Preview dos dados:</span>
                </div>
                {preview.map((item, index) => (
                  <div key={index} className="mb-1 font-mono text-xs">
                    <strong>Linha {item.linha}:</strong> 
                    <span className="text-blue-600">{item.product}</span> |
                    Estoque: <span className={isNaN(Number(item.stock)) ? "text-red-500" : ""}>{item.stock}</span> | 
                    Preço: <span className={isNaN(Number(item.price.replace(",", "."))) ? "text-red-500" : ""}>{item.price}</span> |
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
                  <strong>Total de linhas:</strong> {result.total.toLocaleString()} <br />
                  <strong>Importados com sucesso:</strong> {result.success.toLocaleString()} <br />
                  <strong>Erros:</strong> {result.errors.length.toLocaleString()}
                </p>
                {result.errors.length > 0 && result.errorDetails && (
                  <>
                    <details>
                      <summary className="cursor-pointer font-semibold text-sm">
                        Ver códigos com caracteres especiais ({result.errorDetails.invalidCodes.length})
                      </summary>
                      <div className="mt-2 space-y-1 text-sm max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left">
                              <th>Linha</th>
                              <th>Código Original</th>
                              <th>Código Limpo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.errorDetails.invalidCodes.map((error, idx) => (
                              <tr key={idx} className="text-red-600">
                                <td>{error.line}</td>
                                <td>{error.original}</td>
                                <td>{error.code}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>

                    <details>
                      <summary className="cursor-pointer font-semibold text-sm">
                        Ver outros erros ({result.errorDetails.otherErrors.length})
                      </summary>
                      <ul className="mt-2 space-y-1 text-sm max-h-40 overflow-y-auto">
                        {result.errorDetails.otherErrors.map((error, idx) => (
                          <li key={idx} className="text-red-600">
                            • Linha {error.line}: {error.error}
                          </li>
                        ))}
                      </ul>
                    </details>

                    <div className="mt-4 text-sm">
                      <p className="font-semibold">Sugestões para correção:</p>
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        <li>Verifique se os códigos com caracteres especiais estão corretos</li>
                        <li>Remova caracteres especiais não permitidos (permitidos: letras, números, hífen, ponto e barra)</li>
                        <li>Verifique se os valores de estoque e preço são números válidos</li>
                        <li>Certifique-se de que os campos obrigatórios estão preenchidos</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {file && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <Button
                variant="ghost"
                size="sm"
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
              >
                <X className="h-4 w-4" />
              </Button>
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
