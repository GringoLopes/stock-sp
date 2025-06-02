import type { ProductRepository } from "../../domain/repositories/product.repository"
import type { Product } from "../../domain/entities/product.entity"

export class GetAllProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(): Promise<Product[]> {
    return await this.productRepository.findAll()
  }
} 