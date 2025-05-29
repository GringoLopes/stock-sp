"use client"

import { useQuery } from "@tanstack/react-query"
import { SupabaseProductRepository } from "@/core/infrastructure/repositories/SupabaseProductRepository"

const productRepository = new SupabaseProductRepository()

export function useProductSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      if (!query.trim()) {
        return []
      }
      return await productRepository.search(query.trim())
    },
    enabled: enabled && !!query.trim(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}
