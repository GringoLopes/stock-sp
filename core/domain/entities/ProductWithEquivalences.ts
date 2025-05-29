import type { Product } from "./Product"
import type { Equivalence } from "./Equivalence"

export interface ProductWithEquivalences extends Product {
  equivalences: Equivalence[]
  allRelatedCodes: string[]
}
