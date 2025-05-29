import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { equivalences } = await request.json()

    if (!equivalences || !Array.isArray(equivalences)) {
      return NextResponse.json({ error: "Dados de equivalências inválidos" }, { status: 400 })
    }

    // Validar e preparar dados para inserção
    const validEquivalences = equivalences.map((eq, index) => {
      if (!eq.product_code || !eq.equivalent_code) {
        throw new Error(`Linha ${index + 1}: Ambos os códigos são obrigatórios`)
      }

      if (eq.product_code === eq.equivalent_code) {
        throw new Error(`Linha ${index + 1}: Códigos não podem ser iguais`)
      }

      return {
        product_code: eq.product_code.trim(),
        equivalent_code: eq.equivalent_code.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    const supabase = createServerClient()

    // Inserir equivalências em lotes
    const batchSize = 500
    let totalInserted = 0
    const errors = []

    for (let i = 0; i < validEquivalences.length; i += batchSize) {
      const batch = validEquivalences.slice(i, i + batchSize)

      try {
        const { data, error } = await supabase.from("equivalences").upsert(batch, {
          onConflict: "product_code,equivalent_code",
          ignoreDuplicates: true,
        })

        if (error) {
          console.error("Erro ao inserir lote:", error)
          errors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${error.message}`)
          continue
        }

        // Como estamos usando upsert com ignoreDuplicates, não temos o count exato
        // Vamos fazer uma consulta para verificar quantos foram inseridos
        const { count } = await supabase
          .from("equivalences")
          .select("*", { count: "exact", head: true })
          .in(
            "product_code",
            batch.map((eq) => eq.product_code),
          )
          .in(
            "equivalent_code",
            batch.map((eq) => eq.equivalent_code),
          )

        totalInserted += count || 0
      } catch (batchError) {
        errors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${batchError}`)
      }
    }

    return NextResponse.json({
      success: totalInserted > 0,
      count: totalInserted,
      message: `${totalInserted} equivalências importadas com sucesso`,
      totalProcessed: validEquivalences.length,
      errors: errors,
    })
  } catch (error) {
    console.error("Erro na API de importação:", error)
    return NextResponse.json({ error: `Erro interno do servidor: ${error}` }, { status: 500 })
  }
}
