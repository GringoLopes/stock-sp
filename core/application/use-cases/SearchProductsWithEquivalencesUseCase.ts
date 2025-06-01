import type { IProductRepository } from "@/core/domain/repositories/IProductRepository"
import type { IEquivalenceRepository } from "@/core/domain/repositories/IEquivalenceRepository"
import type { ProductWithEquivalences } from "@/core/domain/entities/ProductWithEquivalences"

interface SearchProductsWithEquivalencesInput {
  query: string
  page: number
  pageSize: number
}

export class SearchProductsWithEquivalencesUseCase {
  constructor(
    private productRepository: IProductRepository,
    private equivalenceRepository: IEquivalenceRepository,
  ) {}

  async execute({ query, page, pageSize }: SearchProductsWithEquivalencesInput): Promise<{
    data: ProductWithEquivalences[],
    total: number
  }> {
    try {
      // Buscar produtos diretamente
      const directSearchResult = await this.productRepository.search(query, page, pageSize)
      const productsWithEquivalences: ProductWithEquivalences[] = []
      
      // Para cada produto encontrado, buscar suas equivalências
      for (const product of directSearchResult.data) {
        // ✅ MUDANÇA AQUI: Usar findByProductCode para buscar apenas onde o produto é product_code
        const productEquivalences = await this.equivalenceRepository.findByProductCode(product.product)
        
        // Coletar apenas os códigos equivalentes
        const equivalentCodes = productEquivalences.map(eq => eq.equivalentCode)
        
        productsWithEquivalences.push({
          ...product,
          equivalences: productEquivalences,
          allRelatedCodes: equivalentCodes // Apenas os códigos equivalentes
        })
      }
  
      return {
        data: productsWithEquivalences,
        total: directSearchResult.total
      }
  
    } catch (error) {
      console.error("Error in SearchProductsWithEquivalencesUseCase:", error)
      return { data: [], total: 0 }
    }
  }
}