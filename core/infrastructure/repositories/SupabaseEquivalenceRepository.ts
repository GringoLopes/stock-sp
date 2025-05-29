import { supabase } from "@/lib/supabase/client"
import type { IEquivalenceRepository } from "@/core/domain/repositories/IEquivalenceRepository"
import type { Equivalence } from "@/core/domain/entities/Equivalence"
import { EquivalenceMapper } from "@/core/application/dtos/EquivalenceDTO"

export class SupabaseEquivalenceRepository implements IEquivalenceRepository {
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

  async findAllEquivalencesForCode(code: string): Promise<Equivalence[]> {
    try {
      // Find equivalences where the code appears as either product_code or equivalent_code
      const { data, error } = await supabase
        .from("equivalences")
        .select("*")
        .or(`product_code.eq.${code},equivalent_code.eq.${code}`)
        .order("product_code")

      if (error) {
        console.error("Error fetching all equivalences for code:", error)
        return []
      }

      return data?.map(EquivalenceMapper.toDomain) || []
    } catch (error) {
      console.error("Repository error:", error)
      return []
    }
  }
}
