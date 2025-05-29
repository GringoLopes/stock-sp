import type { IProductRepository } from "@/core/domain/repositories/IProductRepository"
import type { Product } from "@/core/domain/entities/Product"

export class GetAllProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(): Promise<Product[]> {
    return await this.productRepository.findAll()
  }
}
