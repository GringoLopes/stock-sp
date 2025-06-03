"use client"

import { SupabaseProductRepository } from "@/src/modules/inventory/infrastructure/repositories/supabase-product.repository"
import { useQuery } from "@tanstack/react-query"

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
