import { supabase } from "@/src/shared/infrastructure/database/supabase-wrapper"
import type { IEquivalenceRepository } from "@/core/domain/repositories/IEquivalenceRepository"
import type { Equivalence } from "@/core/domain/entities/Equivalence"
import { EquivalenceMapper } from "@/core/application/dtos/EquivalenceDTO"

export class SupabaseEquivalenceRepository implements IEquivalenceRepository {
  // Busca equivalências pelo código principal do produto
  async findByProductCode(productCode: string): Promise<Equivalence[]> {
    try {
      const supabaseClient = await supabase.from("equivalences")
      const { data, error } = await supabaseClient
        .select("*")
        .eq("product_code", productCode)
        .order("equivalent_code")
        .limit(1000) // Limite para evitar sobrecarga

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
      const supabaseClient = await supabase.from("equivalences")
      const { data, error } = await supabaseClient
        .select("*")
        .eq("equivalent_code", equivalentCode)
        .order("product_code")
        .limit(1000) // Limite para evitar sobrecarga

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
      // Tentar usar a função RPC otimizada primeiro
      const { data, error } = await supabase
        .rpc("get_direct_equivalences", { search_code: code })

      if (error) {
        console.error("Error fetching equivalences for code via RPC:", error)
        
        // Fallback para consulta tradicional se RPC falhar
        return this.findEquivalencesFallback(code)
      }

      return data?.map(EquivalenceMapper.toDomain) || []
    } catch (error) {
      console.error("Repository error:", error)
      
      // Fallback em caso de erro
      return this.findEquivalencesFallback(code)
    }
  }

  // Método fallback para busca de equivalências quando RPC não estiver disponível
  private async findEquivalencesFallback(code: string): Promise<Equivalence[]> {
    try {
      console.log("Using fallback method for equivalences search")
      
      const supabaseClient = await supabase.from("equivalences")
      const { data, error } = await supabaseClient
        .select("*")
        .or(`product_code.eq.${code},equivalent_code.eq.${code}`)
        .order("product_code, equivalent_code")
        .limit(1000)

      if (error) {
        console.error("Error in fallback equivalences search:", error)
        return []
      }

      return data?.map(EquivalenceMapper.toDomain) || []
    } catch (error) {
      console.error("Fallback repository error:", error)
      return []
    }
  }

  // ✅ Busca apenas os códigos dos produtos que são equivalentes ao código informado
  async findProductCodesByEquivalentCode(equivalentCode: string): Promise<string[]> {
    try {
      const supabaseClient = await supabase.from("equivalences")
      const { data, error } = await supabaseClient
        .select("product_code")
        .eq("equivalent_code", equivalentCode)
        .limit(1000) // Limite para evitar sobrecarga

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
