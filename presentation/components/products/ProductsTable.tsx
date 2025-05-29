"use client"

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
}

export function ProductsTable({ products, loading, hasSearched, searchQuery, error }: ProductsTableProps) {
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
                <TableHead className="min-w-[200px]">Produto</TableHead>
                <TableHead className="hidden md:table-cell min-w-[300px]">Aplicação</TableHead>
                <TableHead className="min-w-[120px]">Preço</TableHead>
                <TableHead className="min-w-[150px]">Estoque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="font-bold text-gray-900 break-words">{product.product}</div>
                      <div className="text-sm text-gray-500 md:hidden">
                        {product.application ? (
                          <span className="line-clamp-2" title={product.application}>
                            {product.application}
                          </span>
                        ) : (
                          "Sem aplicação especificada"
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.application ? (
                      <span className="text-sm text-gray-700 line-clamp-2" title={product.application}>
                        {product.application}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Sem aplicação especificada</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold whitespace-nowrap">
                    {product.price > 0 ? (
                      <span className="text-green-700">{formatPrice(product.price)}</span>
                    ) : (
                      <span className="text-gray-400">Consultar</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
