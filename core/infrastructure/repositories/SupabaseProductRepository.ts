import { supabase } from "@/lib/supabase/client"
import type { IProductRepository } from "@/core/domain/repositories/IProductRepository"
import type { Product } from "@/core/domain/entities/Product"
import { ProductMapper } from "@/core/application/dtos/ProductDTO"
import { SupabaseEquivalenceRepository } from "@/core/infrastructure/repositories/SupabaseEquivalenceRepository"

export class SupabaseProductRepository implements IProductRepository {
  private equivalenceRepository = new SupabaseEquivalenceRepository()
  
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

  async search(query: string, page = 1, pageSize = 50): Promise<{ data: Product[], total: number }> {
    try {
      const start = (page - 1) * pageSize;

      // Primeiro, buscar produtos que correspondem diretamente à consulta
      const { data: directMatches, error: directError, count } = await supabase
        .from("products")
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
        
        // ✅ MUDANÇA AQUI: Usar findByProductCode ao invés de findAllEquivalencesForCode
        const equivalences = await this.equivalenceRepository.findByProductCode(productCodes[0]);

        if (equivalences?.length) {
          // Pegar apenas os códigos equivalentes
          const equivalentCodes = equivalences.map(eq => eq.equivalentCode);

          // Buscar os produtos equivalentes
          if (equivalentCodes.length) {
            const { data: equivProducts, error: productsError } = await supabase
              .from("products")
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
        // ✅ MUDANÇA AQUI: Buscar produtos onde o query é um código equivalente
        const productCodes = await this.equivalenceRepository.findProductCodesByEquivalentCode(query);

        if (productCodes.length) {
          // Buscar esses produtos
          const { data: products, error: productsError } = await supabase
            .from("products")
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
}