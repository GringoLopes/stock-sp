import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { data, format } = await request.json()

    if (!data || typeof data !== "string") {
      return NextResponse.json({ error: "Dados são obrigatórios" }, { status: 400 })
    }

    const supabase = createServerClient()
    const products = []
    const errors = []

    // Processar dados baseado no formato
    if (format === "semicolon") {
      const lines = data.split("\n").filter((line) => line.trim())

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const parts = line.split(";")

        if (parts.length < 3) {
          errors.push(`Linha ${i + 1}: Formato inválido`)
          continue
        }

        try {
          const product = parts[0]?.trim()
          const stock = Number.parseInt(parts[1]?.trim() || "0")
          const price = Number.parseFloat(parts[2]?.trim().replace(",", ".") || "0")
          const application = parts[3]?.trim() || null

          if (!product) {
            errors.push(`Linha ${i + 1}: Nome do produto é obrigatório`)
            continue
          }

          products.push({
            product,
            stock: Math.min(stock, 2147483647),
            price: Math.min(price, 99999999.99),
            application,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        } catch (error) {
          errors.push(`Linha ${i + 1}: Erro ao processar - ${error}`)
        }
      }
    }

    if (products.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum produto válido encontrado",
          details: errors.slice(0, 10),
        },
        { status: 400 },
      )
    }

    // Inserir em lotes de 1000 para melhor performance
    const batchSize = 1000
    let totalInserted = 0
    const insertErrors = []

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)

      try {
        const { data: insertedData, error } = await supabase.from("products").insert(batch).select()

        if (error) {
          console.error("Erro ao inserir lote:", error)
          insertErrors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${error.message}`)
          continue
        }

        totalInserted += insertedData?.length || 0
      } catch (batchError) {
        insertErrors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${batchError}`)
      }
    }

    return NextResponse.json({
      success: totalInserted > 0,
      count: totalInserted,
      message: `${totalInserted} produtos importados com sucesso`,
      totalProcessed: products.length,
      parseErrors: errors.length,
      insertErrors: insertErrors.length,
      details: {
        parseErrors: errors.slice(0, 5),
        insertErrors: insertErrors.slice(0, 5),
      },
    })
  } catch (error) {
    console.error("Erro na API bulk import:", error)
    return NextResponse.json({ error: `Erro interno do servidor: ${error}` }, { status: 500 })
  }
}
