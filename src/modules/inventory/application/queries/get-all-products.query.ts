import type { ProductRepository } from "../../domain/repositories/product.repository"
import type { Product } from "../../domain/entities/product.entity"
import { Query } from "@/src/shared/types/common"
import { PaginationOptions } from "@/src/shared/types/pagination"

export type GetAllProductsRequest = {
  pagination?: PaginationOptions
}

export interface GetAllProductsResponse {
  products: Product[]
  total: number
  currentPage: number
  totalPages: number
  hasMore: boolean
}

export class GetAllProductsQuery implements Query<GetAllProductsRequest, GetAllProductsResponse> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(request: GetAllProductsRequest): Promise<GetAllProductsResponse> {
    try {
      const result = await this.productRepository.findAll(request.pagination)

      return {
        products: result.data,
        total: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasMore: result.hasMore
      }
    } catch (error) {
      console.error("Error getting all products:", error)
      return {
        products: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        hasMore: false
      }
    }
  }
}
