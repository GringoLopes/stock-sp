import type { ProductRepository } from "../../domain/repositories/product.repository"
import type { Product } from "../../domain/entities/product.entity"
import { Query } from "@/src/shared/types/common"

export type GetAllProductsRequest = {}

export interface GetAllProductsResponse {
  products: Product[]
  total: number
}

export class GetAllProductsQuery implements Query<GetAllProductsRequest, GetAllProductsResponse> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(_request: GetAllProductsRequest): Promise<GetAllProductsResponse> {
    try {
      const products = await this.productRepository.findAll()

      return {
        products,
        total: products.length,
      }
    } catch (error) {
      console.error("Error getting all products:", error)
      return {
        products: [],
        total: 0,
      }
    }
  }
}
