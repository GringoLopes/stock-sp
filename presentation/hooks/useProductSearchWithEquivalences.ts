"use client"

import { useQuery } from "@tanstack/react-query"
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
      return await productRepository.search(query.trim(), page, pageSize)
    },
    enabled: enabled && !!query.trim(),
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 10 * 60 * 1000, // 10 minutos
    cacheTime: 15 * 60 * 1000, // 15 minutos
    keepPreviousData: true, // Manter dados anteriores durante a paginação
    refetchOnWindowFocus: false, // Não recarregar ao focar a janela
  })
}
