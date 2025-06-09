import type { ProductRepository, ProductSearchCriteria } from "../../domain/repositories/product.repository"
import type { Product } from "../../domain/entities/product.entity"
import { Query } from "@/src/shared/types/common"

export interface SearchProductsRequest {
  query: string
  page?: number
  pageSize?: number
}

export interface SearchProductsResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
}

export class SearchProductsQuery implements Query<SearchProductsRequest, SearchProductsResponse> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(request: SearchProductsRequest): Promise<SearchProductsResponse> {
    try {
      const { query = "", page = 1, pageSize = 50 } = request
      const result = await this.productRepository.search(query, page, pageSize)

      return {
        products: result.data,
        total: result.total,
        page,
        pageSize
      }
    } catch (error) {
      console.error("Error searching products:", error)
      return {
        products: [],
        total: 0,
        page: request.page || 1,
        pageSize: request.pageSize || 50
      }
    }
  }
}
