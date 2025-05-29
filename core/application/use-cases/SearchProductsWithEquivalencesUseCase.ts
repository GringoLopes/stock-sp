import type { IProductRepository } from "@/core/domain/repositories/IProductRepository"
import type { IEquivalenceRepository } from "@/core/domain/repositories/IEquivalenceRepository"
import type { ProductWithEquivalences } from "@/core/domain/entities/ProductWithEquivalences"

export class SearchProductsWithEquivalencesUseCase {
  constructor(
    private productRepository: IProductRepository,
    private equivalenceRepository: IEquivalenceRepository,
  ) {}

  async execute(query: string): Promise<ProductWithEquivalences[]> {
    try {
      // First, search for products directly
      const directProducts = await this.productRepository.search(query)

      // Then, find equivalences for the search query
      const equivalences = await this.equivalenceRepository.findAllEquivalencesForCode(query)

      // Get all related codes from equivalences
      const relatedCodes = new Set<string>()
      equivalences.forEach((eq) => {
        relatedCodes.add(eq.productCode)
        relatedCodes.add(eq.equivalentCode)
      })

      // Search for products using related codes
      const equivalentProducts = []
      for (const code of relatedCodes) {
        const products = await this.productRepository.search(code)
        equivalentProducts.push(...products)
      }

      // Combine and deduplicate products
      const allProducts = [...directProducts, ...equivalentProducts]
      const uniqueProducts = allProducts.filter(
        (product, index, self) => index === self.findIndex((p) => p.id === product.id),
      )

      // Enhance each product with its equivalences
      const productsWithEquivalences: ProductWithEquivalences[] = []

      for (const product of uniqueProducts) {
        const productEquivalences = await this.equivalenceRepository.findAllEquivalencesForCode(product.product)

        // Get all related codes for this product
        const allRelatedCodes = new Set<string>([product.product])
        productEquivalences.forEach((eq) => {
          allRelatedCodes.add(eq.productCode)
          allRelatedCodes.add(eq.equivalentCode)
        })

        productsWithEquivalences.push({
          ...product,
          equivalences: productEquivalences,
          allRelatedCodes: Array.from(allRelatedCodes).filter((code) => code !== product.product),
        })
      }

      return productsWithEquivalences
    } catch (error) {
      console.error("Error in SearchProductsWithEquivalencesUseCase:", error)
      return []
    }
  }
}
