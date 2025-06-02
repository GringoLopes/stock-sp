import type { ProductRepository, ProductSearchCriteria } from "../../domain/repositories/product.repository"
import type { Product } from "../../domain/entities/product.entity"
import { ProductEntity } from "../../domain/entities/product.entity"
import { ID } from "@/src/shared/types/common"
import { supabase } from "@/src/shared/infrastructure/database/supabase-wrapper"
import { PaginatedResult, PaginationOptions } from "@/src/shared/types/pagination"
import { ProductMapper } from "../../application/dtos/product.dto"
import { SupabaseEquivalenceRepository } from "./supabase-equivalence.repository"

// Estender o tipo de critérios de busca para incluir limit
interface ExtendedProductSearchCriteria extends ProductSearchCriteria {
  limit?: number
}

export class SupabaseProductRepository implements ProductRepository {
  private equivalenceRepository = new SupabaseEquivalenceRepository()
  
  async findAll(): Promise<Product[]> {
    try {
      const supabaseClient = await supabase.from("products")
      const { data, error } = await supabaseClient.select("*").order("product")

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
      const supabaseClient = await supabase.from("products")
      const { data, error } = await supabaseClient.select("*").eq("id", id).single()

      if (error || !data) {
        return null
      }

      return ProductMapper.toDomain(data)
    } catch (error) {
      console.error("Repository error:", error)
      return null
    }
  }

  async search(query: string, page = 1, pageSize = 50): Promise<{ data: Product[], total: number }> {
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
        data: paginatedProducts.map(ProductMapper.toDomain),
        total: uniqueProducts.length
      }
    } catch (error) {
      console.error("Repository error:", error)
      return { data: [], total: 0 }
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
