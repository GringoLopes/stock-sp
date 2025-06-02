"use client"

import { useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { SupabaseProductRepository } from "@/src/modules/inventory/infrastructure/repositories/supabase-product.repository"
import { SupabaseEquivalenceRepository } from "@/src/modules/inventory/infrastructure/repositories/supabase-equivalence.repository"
import { SearchProductsWithEquivalencesUseCase } from "@/src/modules/inventory/application/use-cases/search-products-with-equivalences.use-case"
import type { ProductWithEquivalences } from "@/src/modules/inventory/domain/entities/product-with-equivalences.entity"
import { useQuery } from '@tanstack/react-query';

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

