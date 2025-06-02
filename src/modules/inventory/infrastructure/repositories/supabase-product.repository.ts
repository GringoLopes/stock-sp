import type { ProductRepository, ProductSearchCriteria } from "../../domain/repositories/product.repository"
import type { Product } from "../../domain/entities/product.entity"
import { ProductEntity } from "../../domain/entities/product.entity"
import { ID } from "@/src/shared/types/common"
import { supabase } from "@/src/shared/infrastructure/database/supabase-client"

// Tipos para paginação
export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  totalCount: number
  hasMore: boolean
  currentPage: number
  totalPages: number
}

// Estender o tipo de critérios de busca para incluir limit
interface ExtendedProductSearchCriteria extends ProductSearchCriteria {
  limit?: number
}

export class SupabaseProductRepository implements ProductRepository {
  // Método original mantido para compatibilidade
  async findAll(): Promise<Product[]> {
    // Para manter compatibilidade, vamos usar paginação com limite alto
    const result = await this.findAllPaginated({ page: 1, limit: 10000 })
    return result.data
  }

  // Nova versão paginada para melhor performance
  async findAllPaginated(options: PaginationOptions = {}): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 100 } = options
    const offset = (page - 1) * limit

    try {
      // Busca os dados com paginação
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("product")
        .range(offset, offset + limit - 1)

      if (error) {
        console.error("Error fetching paginated products:", error)
        throw error
      }

      // Busca o total de registros para calcular paginação
      const { count, error: countError } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true })

      if (countError) {
        console.error("Error counting products:", countError)
        throw countError
      }

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)
      const hasMore = page < totalPages

      return {
        data: data?.map(this.mapToEntity) || [],
        totalCount,
        hasMore,
        currentPage: page,
        totalPages
      }
    } catch (error) {
      console.error("Repository error:", error)
      return {
        data: [],
        totalCount: 0,
        hasMore: false,
        currentPage: page,
        totalPages: 0
      }
    }
  }

  async findById(id: ID): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

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
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("product", code)
        .single()

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
        // Usar busca otimizada com índice GIN quando disponível
        // Se não tiver o índice, usar ILIKE normal
        query = query.ilike("product", `%${criteria.query}%`)
      }

      if (criteria.minPrice !== undefined) {
        query = query.gte("price", criteria.minPrice)
      }

      if (criteria.maxPrice !== undefined) {
        query = query.lte("price", criteria.maxPrice)
      }

      // Adicionar paginação implícita para evitar resultados muito grandes
      const limit = 500 // Limite padrão para evitar sobrecarga
      query = query.limit(limit)

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

  async save(entity: ProductEntity): Promise<void> {
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
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)

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
