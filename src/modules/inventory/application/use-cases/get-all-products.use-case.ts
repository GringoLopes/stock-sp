import type { ProductRepository } from "../../domain/repositories/product.repository"
import { ProductEntity } from "../../domain/entities/product.entity"
import { PaginatedResult } from "@/src/shared/types/pagination"

export class GetAllProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(): Promise<PaginatedResult<ProductEntity>> {
    return await this.productRepository.findAll()
  }
} 