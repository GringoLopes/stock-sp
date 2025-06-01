import type { ProductRepository, ProductSearchCriteria } from "../../domain/repositories/product.repository"
import type { Product } from "../../domain/entities/product.entity"
import { Query } from "@/src/shared/types/common"

export interface SearchProductsRequest extends ProductSearchCriteria {}

export interface SearchProductsResponse {
  products: Product[]
  total: number
  criteria: ProductSearchCriteria
}

export class SearchProductsQuery implements Query<SearchProductsRequest, SearchProductsResponse> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(request: SearchProductsRequest): Promise<SearchProductsResponse> {
    try {
      const products = await this.productRepository.search(request)

      return {
        products,
        total: products.length,
        criteria: request,
      }
    } catch (error) {
      console.error("Error searching products:", error)
      return {
        products: [],
        total: 0,
        criteria: request,
      }
    }
  }
}
