"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, AlertCircle, Package } from "lucide-react"
import type { ProductWithEquivalences } from "@/core/domain/entities/ProductWithEquivalences"

interface ProductsTableProps {
  products: ProductWithEquivalences[]
  loading?: boolean
  hasSearched: boolean
  searchQuery: string
  error?: any
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function ProductsTable({ products, loading, hasSearched, searchQuery, error, total, page, pageSize, onPageChange }: ProductsTableProps) {
  // Hook para detectar se a tela é menor que 600px
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Função para verificar o tamanho da tela
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 600)
    }

    // Verifica no início
    checkScreenSize()

    // Adiciona listener para mudanças no tamanho da tela
    window.addEventListener('resize', checkScreenSize)

    // Remove o listener quando o componente desmontar
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("pt-BR").format(number)
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Resultados da Busca</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Buscando produtos...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Resultados da Busca</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao buscar produtos: {error.message || "Erro desconhecido"}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Initial state - no search performed
  if (!hasSearched) {
    return (
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma busca realizada</h3>
            <p className="text-gray-500 max-w-md text-sm sm:text-base">
              Use o formulário acima para buscar produtos por nome, código ou aplicação.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No results found
  if (hasSearched && products.length === 0) {
    return (
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Resultados da Busca</CardTitle>
          <div className="text-sm text-gray-600">
            Busca por: <strong className="break-all">"{searchQuery}"</strong>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500 max-w-md text-sm sm:text-base">
              Não foram encontrados produtos que correspondam à sua busca por "{searchQuery}". Tente usar termos
              diferentes ou verifique a ortografia.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Results found
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Resultados da Busca</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="text-sm text-gray-600">
            <strong>{products.length}</strong> produto{products.length !== 1 ? "s" : ""} encontrado
            {products.length !== 1 ? "s" : ""} para: <strong className="break-all">"{searchQuery}"</strong>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] md:w-[25%]">Produto</TableHead>
                {!isMobile && (
                  <TableHead className="w-[45%]">Aplicação</TableHead>
                )}
                <TableHead className="text-right w-[100px] md:w-[15%]">Preço</TableHead>
                <TableHead className="text-center w-[100px] md:w-[15%]">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium w-[200px] md:w-[25%]">
                    <div className="space-y-1">
                      <div className="font-medium">{product.product}</div>
                    </div>
                  </TableCell>
                  {!isMobile && (
                    <TableCell className="w-[45%]">
                      {product.application ? (
                        <div className="max-w-[500px] overflow-hidden">
                          <span className="text-sm text-gray-700 line-clamp-2 hover:line-clamp-none" title={product.application}>
                            {product.application}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Sem aplicação especificada</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right w-[100px] md:w-[15%]">
                    {product.price > 0 ? (
                      <span className="text-green-700">{formatPrice(product.price)}</span>
                    ) : (
                      <span className="text-gray-400">Consultar</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center w-[100px] md:w-[15%]">
                    {formatNumber(product.stock)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}