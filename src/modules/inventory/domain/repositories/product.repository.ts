import { Repository } from "@/src/shared/types/common"
import type { Product } from "../entities/product.entity"
import { PaginatedResult, PaginationOptions } from "../../infrastructure/repositories/supabase-product.repository"

export interface ProductSearchCriteria {
  query?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  active?: boolean
}

export interface ProductRepository extends Repository<Product> {
  findAll(options?: PaginationOptions): Promise<PaginatedResult<Product>>
  findByCode(code: string): Promise<Product | null>
  findByBarcode(barcode: string): Promise<Product | null>
  search(criteria: ProductSearchCriteria): Promise<Product[]>
  findByCategory(category: string): Promise<Product[]>
  findByBrand(brand: string): Promise<Product[]>
}
