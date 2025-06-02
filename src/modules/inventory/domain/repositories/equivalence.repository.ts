import type { Equivalence } from "../entities/equivalence.entity"

export interface EquivalenceRepository {
  findByProductCode(productCode: string): Promise<Equivalence[]>
  findByEquivalentCode(equivalentCode: string): Promise<Equivalence[]>
  findAllEquivalencesForCode(code: string): Promise<Equivalence[]>
} 