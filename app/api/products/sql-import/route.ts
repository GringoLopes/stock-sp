import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

type ImportResponse = {
  success: boolean
  count: number
  message: string
  totalProcessed: number
  parseErrors: number
  insertErrors: number
  details?: {
    parseErrors: string[]
    insertErrors: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()

    if (!sql || typeof sql !== "string") {
      return NextResponse.json({ error: "Comando SQL é obrigatório" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Validar que é apenas um comando INSERT
    const trimmedSQL = sql.trim().toLowerCase()
    if (!trimmedSQL.startsWith("insert into products")) {
      return NextResponse.json({ error: "Apenas comandos INSERT INTO products são permitidos" }, { status: 400 })
    }

    // Verificar se não contém comandos perigosos
    const dangerousKeywords = ["drop", "delete", "update", "alter", "create", "truncate"]
    if (dangerousKeywords.some((keyword) => trimmedSQL.includes(keyword))) {
      return NextResponse.json({ error: "Comando contém palavras-chave não permitidas" }, { status: 400 })
    }

    // Extrair os valores do INSERT
    const insertMatch = sql.match(/VALUES\s*(.+)/i)
    if (!insertMatch) {
      return NextResponse.json({ error: "Formato de SQL inválido" }, { status: 400 })
    }

    const valuesString = insertMatch[1]
    const products = []
    const errors = []

    // Função para limpar e validar valores
    const cleanValue = (value: string): string => {
      return value.trim().replace(/^['"`]|['"`]$/g, "")
    }

    const validateAndParsePrice = (priceStr: string): number => {
      if (priceStr === "NULL" || !priceStr) return 0.0

      const cleaned = priceStr.replace(/[^\d.-]/g, "")
      const price = Number.parseFloat(cleaned)

      if (isNaN(price)) return 0.0

      // Validar limites do DECIMAL(10,2)
      // Máximo: 99999999.99
      if (price > 99999999.99) return 99999999.99
      if (price < 0) return 0.0

      // Arredondar para 2 casas decimais
      return Math.round(price * 100) / 100
    }

    const validateAndParseStock = (stockStr: string): number => {
      if (stockStr === "NULL" || !stockStr) return 0

      const cleaned = stockStr.replace(/[^\d-]/g, "")
      const stock = Number.parseInt(cleaned)

      if (isNaN(stock)) return 0
      if (stock < 0) return 0

      // Validar limite máximo para INTEGER
      if (stock > 2147483647) return 2147483647

      return stock
    }

    // Processar cada linha de valores
    try {
      // Dividir por '),(' para separar as linhas
      const lines = valuesString.split(/\),\s*\(/g)

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim()

        // Remover parênteses do início e fim
        line = line.replace(/^$$/, "").replace(/$$$/, "").replace(/;$/, "")

        try {
          // Parse mais robusto para CSV dentro de SQL
          const values = []
          let current = ""
          let inQuotes = false
          let quoteChar = ""

          for (let j = 0; j < line.length; j++) {
            const char = line[j]

            if ((char === "'" || char === '"') && !inQuotes) {
              inQuotes = true
              quoteChar = char
            } else if (char === quoteChar && inQuotes) {
              inQuotes = false
              quoteChar = ""
            } else if (char === "," && !inQuotes) {
              values.push(current.trim())
              current = ""
              continue
            }

            if (!(char === "'" || char === '"') || inQuotes) {
              current += char
            }
          }

          if (current.trim()) {
            values.push(current.trim())
          }

          if (values.length < 3) {
            errors.push(`Linha ${i + 1}: Dados insuficientes (mínimo: product, stock, price)`)
            continue
          }

          const productName = cleanValue(values[0])
          if (!productName || productName === "NULL") {
            errors.push(`Linha ${i + 1}: Nome do produto é obrigatório`)
            continue
          }

          const stock = validateAndParseStock(values[1])
          const price = validateAndParsePrice(values[2])
          const application = values[3] && cleanValue(values[3]) !== "NULL" ? cleanValue(values[3]) : null

          products.push({
            product: productName,
            stock: stock,
            price: price,
            application: application,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        } catch (parseError) {
          errors.push(`Linha ${i + 1}: Erro ao processar dados - ${parseError}`)
        }
      }
    } catch (parseError) {
      return NextResponse.json({ error: `Erro ao processar SQL: ${parseError}` }, { status: 400 })
    }

    if (products.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum produto válido encontrado no SQL",
          details: errors.slice(0, 10),
        },
        { status: 400 },
      )
    }

    // Inserir em lotes menores para evitar timeouts
    const batchSize = 500
    let totalInserted = 0
    const insertErrors = []

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)

      try {
        const { data, error } = await supabase.from("products").insert(batch).select()

        if (error) {
          console.error("Erro ao inserir lote:", error)
          insertErrors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${error.message}`)
          continue
        }

        totalInserted += data?.length || 0
      } catch (batchError) {
        insertErrors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${batchError}`)
      }
    }

    const response: ImportResponse = {
      success: totalInserted > 0,
      count: totalInserted,
      message: `${totalInserted} produtos importados com sucesso`,
      totalProcessed: products.length,
      parseErrors: errors.length,
      insertErrors: insertErrors.length,
    }

    if (errors.length > 0 || insertErrors.length > 0) {
      response.details = {
        parseErrors: errors.slice(0, 5),
        insertErrors: insertErrors.slice(0, 5),
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro na API SQL:", error)
    return NextResponse.json({ error: `Erro interno do servidor: ${error}` }, { status: 500 })
  }
}
