import { supabase } from "@/lib/supabase/client"
import type { IProductRepository } from "@/core/domain/repositories/IProductRepository"
import type { Product } from "@/core/domain/entities/Product"
import { ProductMapper } from "@/core/application/dtos/ProductDTO"

export class SupabaseProductRepository implements IProductRepository {
  async findAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from("products").select("*").order("product")

      if (error) {
        console.error("Error fetching products:", error)
        return []
      }

      return data?.map(ProductMapper.toDomain) || []
    } catch (error) {
      console.error("Repository error:", error)
      return []
    }
  }

  async findById(id: string | number): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

      if (error || !data) {
        return null
      }

      return ProductMapper.toDomain(data)
    } catch (error) {
      console.error("Repository error:", error)
      return null
    }
  }

  async search(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("product", `%${query}%`)
        .order("product")

      if (error) {
        console.error("Error searching products:", error)
        return []
      }

      return data?.map(ProductMapper.toDomain) || []
    } catch (error) {
      console.error("Repository error:", error)
      return []
    }
  }
}
