"use client"

import { useQuery } from '@tanstack/react-query';
import { SupabaseProductRepository } from "@/core/infrastructure/repositories/SupabaseProductRepository"
import { SupabaseEquivalenceRepository } from "@/core/infrastructure/repositories/SupabaseEquivalenceRepository"
import { SearchProductsWithEquivalencesUseCase } from "@/core/application/use-cases/SearchProductsWithEquivalencesUseCase"

const productRepository = new SupabaseProductRepository()
const equivalenceRepository = new SupabaseEquivalenceRepository()
const searchUseCase = new SearchProductsWithEquivalencesUseCase(productRepository, equivalenceRepository)

interface UseProductSearchWithEquivalencesProps {
  query: string
  page?: number
  pageSize?: number
  enabled?: boolean
}

export function useProductSearchWithEquivalences({
  query,
  page = 1,
  pageSize = 50,
  enabled = true
}: UseProductSearchWithEquivalencesProps) {
  return useQuery({
    queryKey: ["products", "search-with-equivalences", query, page, pageSize],
    queryFn: async () => {
      if (!query.trim()) {
        return { data: [], total: 0 }
      }

      return await searchUseCase.execute({
        query: query.trim(),
        page,
        pageSize
      })
    },
    enabled: enabled && !!query.trim(),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  })
}

