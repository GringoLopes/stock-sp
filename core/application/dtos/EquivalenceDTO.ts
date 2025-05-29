import type { Equivalence } from "@/core/domain/entities/Equivalence"

export interface EquivalenceDTO {
  id: string | number
  product_code: string
  equivalent_code: string
  created_at: string
  updated_at: string
}

export class EquivalenceMapper {
  static toDomain(dto: EquivalenceDTO): Equivalence {
    return {
      id: dto.id,
      productCode: dto.product_code,
      equivalentCode: dto.equivalent_code,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    }
  }
}
