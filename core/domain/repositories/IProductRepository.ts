import type { Product } from "@/core/domain/entities/Product"

export interface IProductRepository {
  findAll(): Promise<Product[]>
  findById(id: string | number): Promise<Product | null>
  search(query: string): Promise<Product[]>
}
