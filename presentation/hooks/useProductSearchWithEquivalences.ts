"use client"

import { useQuery } from "@tanstack/react-query"
import { SupabaseProductRepository } from "@/core/infrastructure/repositories/SupabaseProductRepository"
import { SupabaseEquivalenceRepository } from "@/core/infrastructure/repositories/SupabaseEquivalenceRepository"
import { SearchProductsWithEquivalencesUseCase } from "@/core/application/use-cases/SearchProductsWithEquivalencesUseCase"

const productRepository = new SupabaseProductRepository()
const equivalenceRepository = new SupabaseEquivalenceRepository()
const searchUseCase = new SearchProductsWithEquivalencesUseCase(productRepository, equivalenceRepository)

export function useProductSearchWithEquivalences(query: string, enabled = true) {
  return useQuery({
    queryKey: ["products", "search-with-equivalences", query],
    queryFn: async () => {
      if (!query.trim()) {
        return []
      }
      return await searchUseCase.execute(query.trim())
    },
    enabled: enabled && !!query.trim(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}
