"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  FileText,
  Upload,
  X
} from "lucide-react"
import type React from "react"
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

interface Equivalence {
  productCode: string
  equivalentCode: string
  cleanProductCode?: string
  cleanEquivalentCode?: string
}

export function EquivalenceCSVImport() {
  // Estados para importação em massa
  const [file, setFile] = useState<File | null>(null)
  const [textData, setTextData] = useState("")
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados para gerenciamento individual
  const [productCode, setProductCode] = useState("")
  const [equivalentCode, setEquivalentCode] = useState("")
  const [loading, setLoading] = useState(false)

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

  const detectSeparator = (text: string): ";" | "," => {
    const firstLine = text.split("\n")[0] || ""
    const semicolonCount = (firstLine.match(/;/g) || []).length
    const commaCount = (firstLine.match(/,/g) || []).length
    
    return semicolonCount >= commaCount ? ";" : ","
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

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

    // Verificar tamanho (50MB)
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

      // Verificar se tem o formato esperado
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
      const separator = detectSeparator(text)
      
      const previewData = lines.slice(0, 5).map((line, index) => {
        const parts = line.split(separator)
        const productCode = parts[0]?.trim().replace(/"/g, "") || ""
        const equivalentCode = parts[1]?.trim().replace(/"/g, "") || ""

        const equivalence: Equivalence = {
          productCode,
          equivalentCode
        }

        // Usar a mesma lógica de validação
        const validationError = validateEquivalence(equivalence, index)

        return {
          linha: index + 1,
          productCode,
          equivalentCode,
          cleanProductCode: equivalence.cleanProductCode || "",
          cleanEquivalentCode: equivalence.cleanEquivalentCode || "",
          hasChanges: productCode !== equivalence.cleanProductCode || equivalentCode !== equivalence.cleanEquivalentCode,
          error: validationError
        }
      })
      setPreview(previewData)
    } catch (error) {
      console.error("Erro ao processar preview:", error)
    }
  }

  const parseCSVData = (text: string): Equivalence[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    const separator = detectSeparator(text)

    return lines.map((line, index) => {
      const parts = line.split(separator)

      if (parts.length < 2) {
        throw new Error(`Linha ${index + 1}: Formato inválido. Esperado: código_produto${separator}código_equivalente`)
      }

      const productCode = parts[0]?.trim().replace(/"/g, "") || ""
      const equivalentCode = parts[1]?.trim().replace(/"/g, "") || ""

      // Limpeza básica dos códigos
      const cleanProductCode = productCode
        .trim()
        .replace(/\s*\([^)]*\)/g, "") // Remove parênteses e seu conteúdo
        .replace(/\s+.*$/, "") // Remove tudo após o primeiro espaço
        .replace(/\.$/, "") // Remove ponto final se existir
        .replace(/[\x00-\x1F\x7F]+/g, "") // Remove caracteres de controle
        .replace(/^\s+|\s+$/g, "") // Remove espaços no início e fim

      const cleanEquivalentCode = equivalentCode
        .trim()
        .replace(/\s*\([^)]*\)/g, "")
        .replace(/\s+.*$/, "")
        .replace(/\.$/, "")
        .replace(/[\x00-\x1F\x7F]+/g, "")
        .replace(/^\s+|\s+$/g, "")

      return {
        productCode,
        equivalentCode,
        cleanProductCode,
        cleanEquivalentCode
      }
    })
  }

  const validateEquivalence = (eq: Equivalence, index?: number): string | null => {
    // Função auxiliar para limpar e validar códigos
    const cleanAndValidateCode = (code: string, fieldName: string): { error: string | null; cleanCode: string } => {
      if (!code || code.trim() === "") {
        return {
          error: index !== undefined 
            ? `Linha ${index + 1}: ${fieldName} está vazio`
            : `${fieldName} está vazio`,
          cleanCode: ""
        }
      }

      // Limpeza menos restritiva do código
      let cleanCode = code.trim()
        .replace(/[\x00-\x1F\x7F]+/g, "") // Remove caracteres de controle
        .replace(/^\s+|\s+$/g, "") // Remove espaços no início e fim

      // Se ainda houver caracteres após limpeza básica, mantenha-os
      if (cleanCode.length === 0) {
        return {
          error: index !== undefined
            ? `Linha ${index + 1}: ${fieldName} ficou vazio após limpeza. Original: "${code}"`
            : `${fieldName} ficou vazio após limpeza. Original: "${code}"`,
          cleanCode: ""
        }
      }

      return { error: null, cleanCode }
    }

    // Validar código do produto
    const productResult = cleanAndValidateCode(eq.productCode, "Código do produto")
    if (productResult.error) return productResult.error

    // Validar código equivalente
    const equivalentResult = cleanAndValidateCode(eq.equivalentCode, "Código equivalente")
    if (equivalentResult.error) return equivalentResult.error

    // Validar se os códigos são diferentes (mas apenas se forem exatamente iguais)
    if (productResult.cleanCode === equivalentResult.cleanCode) {
      return index !== undefined
        ? `Linha ${index + 1}: Código do produto e código equivalente são idênticos (${productResult.cleanCode})`
        : `Código do produto e código equivalente são idênticos (${productResult.cleanCode})`
    }

    // Atualizar os códigos limpos na equivalência
    eq.cleanProductCode = productResult.cleanCode
    eq.cleanEquivalentCode = equivalentResult.cleanCode

    return null
  }

  const importEquivalences = async () => {
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
      const validRows: Equivalence[] = []
      let processedCount = 0
      const errorDetails = {
        invalidCodes: [] as { line: number; code: string; original: string }[],
        otherErrors: [] as { line: number; error: string }[]
      }

      // Validar dados
      for (const row of rows) {
        const error = validateEquivalence(row, processedCount)
        if (error) {
          errors.push(error)
          if (error.includes("caracteres inválidos")) {
            errorDetails.invalidCodes.push({
              line: processedCount + 1,
              code: row.productCode,
              original: row.productCode
            })
          } else {
            errorDetails.otherErrors.push({
              line: processedCount + 1,
              error: error
            })
          }
        } else {
          validRows.push({
            productCode: row.productCode.trim(),
            equivalentCode: row.equivalentCode.trim(),
            cleanProductCode: row.cleanProductCode,
            cleanEquivalentCode: row.cleanEquivalentCode
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

      // Importar em lotes
      const batchSize = 500
      let successCount = 0

      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize)

        try {
          const response = await fetch("/api/equivalences/import", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              equivalences: batch.map(eq => ({
                product_code: eq.cleanProductCode || eq.productCode.trim(),
                equivalent_code: eq.cleanEquivalentCode || eq.equivalentCode.trim(),
                original_product_code: eq.productCode.trim(),
                original_equivalent_code: eq.equivalentCode.trim()
              }))
            }),
          })

          if (response.ok) {
            const result = await response.json()
            successCount += result.count || batch.length
          } else {
            const errorData = await response.json()
            errors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${errorData.error}`)
            errorDetails.otherErrors.push({
              line: i + 1,
              error: `Erro no lote ${Math.floor(i / batchSize) + 1}: ${errorData.error}`
            })
          }
        } catch (error) {
          const errorMessage = `Lote ${Math.floor(i / batchSize) + 1}: Erro de conexão`
          errors.push(errorMessage)
          errorDetails.otherErrors.push({
            line: i + 1,
            error: errorMessage
          })
        }

        setProgress(50 + Math.round(((i + batchSize) / validRows.length) * 50))
      }

      setResult({
        total: rows.length,
        success: successCount,
        errors,
        errorDetails
      })

      if (successCount > 0) {
        toast({
          title: "Importação concluída",
          description: `${successCount.toLocaleString()} equivalências importadas com sucesso.`,
        })
      }
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
      ";": `2040PM-OR;FCD0732
2040PM-OR;ALT0001
13E;EQV13E
14E;EQV14E
0986B03526;ALT0986B`,
      ",": `"2040PM-OR","FCD0732"
"2040PM-OR","ALT0001"
"13E","EQV13E"
"14E","EQV14E"
"0986B03526","ALT0986B"`
    } as const

    const template = templates[actualSeparator]
    const extension = actualSeparator === "," ? "csv" : "txt"
    const mimeType = actualSeparator === "," ? "text/csv" : "text/plain"

    const blob = new Blob([template], { type: `${mimeType};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `template-equivalencias.${extension}`
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

  // Funções para gerenciamento individual
  const handleAddEquivalence = async () => {
    const equivalence = { productCode, equivalentCode }
    const error = validateEquivalence(equivalence)
    
    if (error) {
      toast({
        title: "Campos inválidos",
        description: error,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/equivalences/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          equivalences: [{
            product_code: productCode.trim(),
            equivalent_code: equivalentCode.trim()
          }]
        }),
      })

      if (response.ok) {
        toast({
          title: "Equivalência adicionada",
          description: `Equivalência entre ${productCode} e ${equivalentCode} criada com sucesso.`,
        })
        setProductCode("")
        setEquivalentCode("")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao adicionar equivalência: ${error}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearImportForm = () => {
    setFile(null)
    setTextData("")
    setResult(null)
    setPreview([])
    setShowPreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Equivalências
        </CardTitle>
        <CardDescription>
          Importe equivalências em massa usando arquivos CSV ou TXT. Suporta arquivos grandes e diferentes formatos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Importe equivalências no formato CSV/TXT
          </p>
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
                <div className="font-semibold mb-2">Preview dos dados:</div>
                {preview.map((item, index) => (
                  <div key={index} className={`mb-2 font-mono text-xs ${item.error ? 'border-l-2 border-red-500 pl-2' : ''}`}>
                    <strong>Linha {item.linha}:</strong> 
                    <span className={`${item.error ? 'text-red-600' : 'text-blue-600'}`}>
                      {item.productCode}
                      {item.hasChanges && item.cleanProductCode !== item.productCode && (
                        <span className="text-green-600"> → {item.cleanProductCode}</span>
                      )}
                    </span> → 
                    <span className={`${item.error ? 'text-red-600' : 'text-blue-600'}`}>
                      {item.equivalentCode}
                      {item.hasChanges && item.cleanEquivalentCode !== item.equivalentCode && (
                        <span className="text-green-600"> → {item.cleanEquivalentCode}</span>
                      )}
                    </span>
                    {item.error && (
                      <div className="text-red-500 mt-1">
                        Erro: {item.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importando equivalências...</span>
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
                        <li>Verifique se os códigos não estão vazios após a limpeza</li>
                        <li>Verifique se os códigos são diferentes entre si</li>
                        <li>Certifique-se de que não há linhas em branco no arquivo</li>
                        <li>Verifique se o arquivo está usando o formato correto (código;equivalente)</li>
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
                onClick={clearImportForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={importEquivalences} disabled={!textData.trim() || importing} className="flex-1">
            {importing ? "Importando..." : "Importar Equivalências"}
          </Button>
          <Button
            variant="outline"
            onClick={clearImportForm}
            disabled={importing}
          >
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
