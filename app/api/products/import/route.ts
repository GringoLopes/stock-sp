import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json()

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: "Dados de produtos inválidos" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Função para validar e limitar valores numéricos
    const validateAndParsePrice = (price: any): number => {
      const numPrice = Number.parseFloat(price)
      if (isNaN(numPrice)) return 0.0

      // Validar limites do DECIMAL(10,2)
      if (numPrice > 99999999.99) return 99999999.99
      if (numPrice < 0) return 0.0

      return Math.round(numPrice * 100) / 100
    }

    const validateAndParseStock = (stock: any): number => {
      const numStock = Number.parseInt(stock)
      if (isNaN(numStock)) return 0
      if (numStock < 0) return 0

      // Validar limite máximo para INTEGER
      if (numStock > 2147483647) return 2147483647

      return numStock
    }

    // Validar e preparar dados para inserção
    const validProducts = products.map((product, index) => {
      if (!product.product || product.product.trim() === "") {
        throw new Error(`Linha ${index + 1}: Nome do produto é obrigatório`)
      }

      return {
        product: product.product.trim(),
        stock: validateAndParseStock(product.stock),
        price: validateAndParsePrice(product.price),
        application: product.application?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    // Inserir produtos em lotes menores
    const batchSize = 500
    let totalInserted = 0
    const errors = []

    for (let i = 0; i < validProducts.length; i += batchSize) {
      const batch = validProducts.slice(i, i + batchSize)

      try {
        const { data, error } = await supabase.from("products").insert(batch).select()

        if (error) {
          console.error("Erro ao inserir lote:", error)
          errors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${error.message}`)
          continue
        }

        totalInserted += data?.length || 0
      } catch (batchError) {
        errors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${batchError}`)
      }
    }

    return NextResponse.json({
      success: totalInserted > 0,
      count: totalInserted,
      message: `${totalInserted} produtos importados com sucesso`,
      totalProcessed: validProducts.length,
      errors: errors,
    })
  } catch (error) {
    console.error("Erro na API de importação:", error)
    return NextResponse.json({ error: `Erro interno do servidor: ${error}` }, { status: 500 })
  }
}
