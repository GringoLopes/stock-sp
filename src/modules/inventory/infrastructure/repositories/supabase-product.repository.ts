import type { ProductRepository, ProductSearchCriteria } from "../../domain/repositories/product.repository"
import { ProductEntity } from "../../domain/entities/product.entity"
import { ID } from "@/src/shared/types/common"
import { supabase } from "@/src/shared/infrastructure/database/supabase-wrapper"
import { PaginatedResult, PaginationOptions } from "@/src/shared/types/pagination"
import { SupabaseEquivalenceRepository } from "./supabase-equivalence.repository"

// Estender o tipo de critérios de busca para incluir limit
interface ExtendedProductSearchCriteria extends ProductSearchCriteria {
  limit?: number
}

export class SupabaseProductRepository implements ProductRepository {
  private equivalenceRepository = new SupabaseEquivalenceRepository()
  
  async findAll(options?: PaginationOptions): Promise<PaginatedResult<ProductEntity>> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 50
      const start = (page - 1) * limit

      const supabaseClient = await supabase.from("products")
      const { data, error, count } = await supabaseClient
        .select("*", { count: "exact" })
        .range(start, start + limit - 1)
        .order("product")

      if (error) {
        console.error("Error fetching products:", error)
        return {
          data: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
          hasMore: false
        }
      }

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)

      return {
        data: data?.map(this.mapToEntity) || [],
        totalCount,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages
      }
    } catch (error) {
      console.error("Repository error:", error)
      return {
        data: [],
        totalCount: 0,
        currentPage: options?.page || 1,
        totalPages: 0,
        hasMore: false
      }
    }
  }

  async findById(id: string | number): Promise<ProductEntity | null> {
    try {
      const supabaseClient = await supabase.from("products")
      const { data, error } = await supabaseClient.select("*").eq("id", id).single()

      if (error || !data) {
        return null
      }

      return this.mapToEntity(data)
    } catch (error) {
      console.error("Repository error:", error)
      return null
    }
  }

  async search(query: string, page = 1, pageSize = 50): Promise<{ data: ProductEntity[], total: number }> {
    try {
      const start = (page - 1) * pageSize;
      const supabaseClient = await supabase.from("products")

      // Primeiro, buscar produtos que correspondem diretamente à consulta
      const { data: directMatches, error: directError, count } = await supabaseClient
        .select("*", { count: "exact" })
        .ilike("product", `%${query}%`)
        .range(start, start + pageSize - 1)
        .order("product");

      if (directError) {
        console.error("Error searching products:", directError)
        return { data: [], total: 0 }
      }

      // Buscar equivalências para os produtos encontrados
      const allProducts = [...(directMatches || [])];
      const equivalentProducts: any[] = [];

      // Se encontrou resultados diretos, buscar suas equivalências
      if (directMatches?.length) {
        const productCodes = directMatches.map(p => p.product);
        
        const equivalences = await this.equivalenceRepository.findByProductCode(productCodes[0]);

        if (equivalences?.length) {
          // Pegar apenas os códigos equivalentes
          const equivalentCodes = equivalences.map(eq => eq.equivalentCode);

          // Buscar os produtos equivalentes
          if (equivalentCodes.length) {
            const supabaseClient = await supabase.from("products")
            const { data: equivProducts, error: productsError } = await supabaseClient
              .select("*")
              .in("product", equivalentCodes)
              .order("product");

            if (!productsError && equivProducts) {
              equivalentProducts.push(...equivProducts);
            }
          }
        }
      } 
      // Se não encontrou resultados diretos, buscar produtos onde o query é equivalent_code
      else {
        const productCodes = await this.equivalenceRepository.findProductCodesByEquivalentCode(query);

        if (productCodes.length) {
          // Buscar esses produtos
          const supabaseClient = await supabase.from("products")
          const { data: products, error: productsError } = await supabaseClient
            .select("*")
            .in("product", productCodes)
            .order("product");

          if (!productsError && products) {
            allProducts.push(...products);
          }
        }
      }

      // Combinar produtos diretos e equivalentes, removendo duplicatas
      const uniqueProducts = [...allProducts, ...equivalentProducts]
        .filter((product, index, self) => 
          index === self.findIndex((p) => p.product === product.product)
        );

      // Aplicar paginação no resultado final
      const start_index = (page - 1) * pageSize;
      const end_index = start_index + pageSize;
      const paginatedProducts = uniqueProducts.slice(start_index, end_index);

      return {
        data: paginatedProducts.map(this.mapToEntity),
        total: uniqueProducts.length
      }
    } catch (error) {
      console.error("Repository error:", error)
      return { data: [], total: 0 }
    }
  }

  async findByCode(code: string): Promise<ProductEntity | null> {
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

  async findByBarcode(barcode: string): Promise<ProductEntity | null> {
    return null
  }

  async findByCategory(category: string): Promise<ProductEntity[]> {
    return []
  }

  async findByBrand(brand: string): Promise<ProductEntity[]> {
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
