import type { Equivalence } from "@/core/domain/entities/Equivalence"

export interface IEquivalenceRepository {
  findByProductCode(productCode: string): Promise<Equivalence[]>
  findByEquivalentCode(equivalentCode: string): Promise<Equivalence[]>
  findAllEquivalencesForCode(code: string): Promise<Equivalence[]>
}
