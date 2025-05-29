import type { Product } from "@/core/domain/entities/Product"

export interface ProductDTO {
  id: string | number
  product: string
  stock: number
  price: number
  application?: string
  created_at: string
  updated_at: string
}

export class ProductMapper {
  static toDomain(dto: ProductDTO): Product {
    return {
      id: dto.id,
      product: dto.product,
      stock: dto.stock,
      price: dto.price,
      application: dto.application,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    }
  }
}
