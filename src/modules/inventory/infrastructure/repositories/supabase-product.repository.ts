import type { ProductRepository, ProductSearchCriteria } from "../../domain/repositories/product.repository"
import type { Product } from "../../domain/entities/product.entity"
import { ProductEntity } from "../../domain/entities/product.entity"
import { supabase } from "@/shared/infrastructure/database/supabase-client"
import type { ID } from "@/shared/types/common"

export class SupabaseProductRepository implements ProductRepository {
  async findAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from("products").select("*").order("product")

      if (error) {
        console.error("Error fetching products:", error)
        return []
      }

      return data?.map(this.mapToEntity) || []
    } catch (error) {
      console.error("Repository error:", error)
      return []
    }
  }

  async findById(id: ID): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

      if (error || !data) return null

      return this.mapToEntity(data)
    } catch (error) {
      console.error("Repository error:", error)
      return null
    }
  }

  async findByCode(code: string): Promise<Product | null> {
    // Since we no longer have a code field, we'll search by product name
    try {
      const { data, error } = await supabase.from("products").select("*").eq("product", code).single()

      if (error || !data) return null

      return this.mapToEntity(data)
    } catch (error) {
      console.error("Repository error:", error)
      return null
    }
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    // Since we no longer have a barcode field, this method is not applicable
    // We'll return null
    return null
  }

  async search(criteria: ProductSearchCriteria): Promise<Product[]> {
    try {
      let query = supabase.from("products").select("*")

      if (criteria.query) {
        query = query.ilike("product", `%${criteria.query}%`)
      }

      if (criteria.minPrice !== undefined) {
        query = query.gte("price", criteria.minPrice)
      }

      if (criteria.maxPrice !== undefined) {
        query = query.lte("price", criteria.maxPrice)
      }

      const { data, error } = await query.order("product")

      if (error) {
        console.error("Error searching products:", error)
        return []
      }

      return data?.map(this.mapToEntity) || []
    } catch (error) {
      console.error("Repository error:", error)
      return []
    }
  }

  async findByCategory(category: string): Promise<Product[]> {
    // Since we no longer have a category field, this method is not applicable
    // We'll return an empty array
    return []
  }

  async findByBrand(brand: string): Promise<Product[]> {
    // Since we no longer have a brand field, this method is not applicable
    // We'll return an empty array
    return []
  }

  async save(entity: Product): Promise<void> {
    try {
      const { error } = await supabase.from("products").upsert({
        id: entity.id,
        product: entity.product,
        stock: entity.stock,
        price: entity.price,
        application: entity.application,
        created_at: entity.createdAt.toISOString(),
        updated_at: entity.updatedAt?.toISOString() || new Date().toISOString(),
      })

      if (error) {
        throw new Error(`Failed to save product: ${error.message}`)
      }
    } catch (error) {
      console.error("Error saving product:", error)
      throw error
    }
  }

  async delete(id: ID): Promise<void> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        throw new Error(`Failed to delete product: ${error.message}`)
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }

  private mapToEntity = (data: any): ProductEntity => {
    return ProductEntity.create({
      id: data.id,
      product: data.product,
      price: Number(data.price),
      stock: data.stock,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      application: data.application,
    })
  }
}
