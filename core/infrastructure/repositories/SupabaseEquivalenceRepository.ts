import { supabase } from "@/lib/supabase/client"
import type { IEquivalenceRepository } from "@/core/domain/repositories/IEquivalenceRepository"
import type { Equivalence } from "@/core/domain/entities/Equivalence"
import { EquivalenceMapper } from "@/core/application/dtos/EquivalenceDTO"

export class SupabaseEquivalenceRepository implements IEquivalenceRepository {
  // Busca equivalências pelo código principal do produto
  async findByProductCode(productCode: string): Promise<Equivalence[]> {
    try {
      const { data, error } = await supabase
        .from("equivalences")
        .select("*")
        .eq("product_code", productCode)
        .order("equivalent_code")

      if (error) {
        console.error("Error fetching equivalences by product code:", error)
        return []
      }

      return data?.map(EquivalenceMapper.toDomain) || []
    } catch (error) {
      console.error("Repository error:", error)
      return []
    }
  }

  // Busca equivalências usando o código equivalente
  async findByEquivalentCode(equivalentCode: string): Promise<Equivalence[]> {
    try {
      const { data, error } = await supabase
        .from("equivalences")
        .select("*")
        .eq("equivalent_code", equivalentCode)
        .order("product_code")

      if (error) {
        console.error("Error fetching equivalences by equivalent code:", error)
        return []
      }

      return data?.map(EquivalenceMapper.toDomain) || []
    } catch (error) {
      console.error("Repository error:", error)
      return []
    }
  }

  // Busca todas as equivalências diretas usando função RPC otimizada
  async findAllEquivalencesForCode(code: string): Promise<Equivalence[]> {
    try {
      const { data, error } = await supabase
        .rpc("get_direct_equivalences", { search_code: code })

      if (error) {
        console.error("Error fetching equivalences for code:", error)
        return []
      }

      return data?.map(EquivalenceMapper.toDomain) || []
    } catch (error) {
      console.error("Repository error:", error)
      return []
    }
  }

  // ✅ Busca apenas os códigos dos produtos que são equivalentes ao código informado
  async findProductCodesByEquivalentCode(equivalentCode: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("equivalences")
        .select("product_code")
        .eq("equivalent_code", equivalentCode)

      if (error) {
        console.error("Error fetching product codes by equivalent code:", error)
        return []
      }

      return data.map(item => item.product_code)
    } catch (error) {
      console.error("Repository error:", error)
      return []
    }
  }
}
