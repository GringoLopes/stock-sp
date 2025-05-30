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
        
        // Buscar equivalências para cada produto encontrado
        const { data: equivalences, error: equivError } = await supabase
          .rpc('get_direct_equivalences', { 
            search_code: productCodes[0] // Buscar equivalências do primeiro produto encontrado
          });

        if (!equivError && equivalences?.length) {
          // Pegar os códigos equivalentes
          const equivalentCodes = equivalences.map(eq => 
            eq.product_code === productCodes[0] ? eq.equivalent_code : eq.product_code
          );

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
      // Se não encontrou resultados diretos, buscar por equivalências
      else {
        const { data: equivalences, error: equivError } = await supabase
          .rpc('get_direct_equivalences', { search_code: query });

        if (!equivError && equivalences?.length) {
          // Pegar os códigos equivalentes
          const equivalentCodes = equivalences.map(eq => 
            eq.product_code === query ? eq.equivalent_code : eq.product_code
          );

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
