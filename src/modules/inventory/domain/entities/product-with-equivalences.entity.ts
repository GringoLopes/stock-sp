import type { Product } from "./product.entity"
import type { Equivalence } from "./equivalence.entity"

export interface ProductWithEquivalences extends Product {
  equivalences: Equivalence[]
  allRelatedCodes: string[]
} 