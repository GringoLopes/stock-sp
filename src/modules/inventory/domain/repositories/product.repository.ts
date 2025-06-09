import { Repository } from "@/src/shared/types/common"
import type { Product } from "../entities/product.entity"
import { ProductEntity } from "../entities/product.entity"
import { PaginatedResult, PaginationOptions } from "@/src/shared/types/pagination"

export interface ProductSearchCriteria {
  query?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  active?: boolean
}

export interface ProductRepository extends Repository<ProductEntity> {
  findAll(options?: PaginationOptions): Promise<PaginatedResult<ProductEntity>>
  findByCode(code: string): Promise<ProductEntity | null>
  findByBarcode(barcode: string): Promise<ProductEntity | null>
  findByCategory(category: string): Promise<ProductEntity[]>
  findByBrand(brand: string): Promise<ProductEntity[]>
  findById(id: string | number): Promise<ProductEntity | null>
  search(query: string, page?: number, pageSize?: number): Promise<{ data: ProductEntity[]; total: number }>
}
