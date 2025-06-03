import type { Product } from "../../domain/entities/product.entity"
import { ID } from "@/src/shared/types/common"

export interface ProductDTO {
  id: ID
  product: string
  stock: number
  price: number
  application?: string
  created_at: string
  updated_at?: string
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
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
    }
  }

  static toDTO(domain: Product): ProductDTO {
    return {
      id: domain.id,
      product: domain.product,
      stock: domain.stock,
      price: domain.price,
      application: domain.application,
      created_at: domain.createdAt.toISOString(),
      updated_at: domain.updatedAt?.toISOString(),
    }
  }
} 