export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  totalCount: number
  hasMore: boolean
  currentPage: number
  totalPages: number
} 