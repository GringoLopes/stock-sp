"use client"

import { useQuery } from "@tanstack/react-query"
import { SupabaseProductRepository } from "@/core/infrastructure/repositories/SupabaseProductRepository"
import { GetAllProductsUseCase } from "@/core/application/use-cases/GetAllProductsUseCase"

const productRepository = new SupabaseProductRepository()
const getAllProductsUseCase = new GetAllProductsUseCase(productRepository)

export function useProducts(enabled = true) {
  return useQuery({
    queryKey: ["products", "all"],
    queryFn: () => getAllProductsUseCase.execute(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
