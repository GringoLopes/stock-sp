"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X, Loader2 } from "lucide-react"

interface ProductSearchFormProps {
  onSearch: (query: string) => void
  onClear: () => void
  isLoading: boolean
  currentQuery: string
}

export function ProductSearchForm({ onSearch, onClear, isLoading, currentQuery }: ProductSearchFormProps) {
  const [inputValue, setInputValue] = useState(currentQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = inputValue.trim()
    if (trimmedQuery) {
      onSearch(trimmedQuery)
    }
  }

  const handleClear = () => {
    setInputValue("")
    onClear()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Search className="h-5 w-5" />
          Buscar Produtos
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Digite o nome do produto, código ou aplicação..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="pr-10 w-full uppercase"
                disabled={isLoading}
              />
              {inputValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputValue("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading} 
              className="sm:w-auto sm:min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          {currentQuery && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 bg-blue-50 p-3 rounded gap-2">
              <span className="text-xs sm:text-sm">
                Resultados para: <strong className="break-all">"{currentQuery}"</strong>
              </span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleClear} 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar busca
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
