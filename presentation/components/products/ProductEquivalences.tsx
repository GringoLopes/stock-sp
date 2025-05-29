"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightLeft } from "lucide-react"
import type { Equivalence } from "@/core/domain/entities/Equivalence"

interface ProductEquivalencesProps {
  equivalences: Equivalence[]
  currentProductCode: string
}

export function ProductEquivalences({ equivalences, currentProductCode }: ProductEquivalencesProps) {
  if (equivalences.length === 0) {
    return null
  }

  // Get unique equivalent codes (excluding the current product code)
  const equivalentCodes = new Set<string>()
  equivalences.forEach((eq) => {
    if (eq.productCode !== currentProductCode) {
      equivalentCodes.add(eq.productCode)
    }
    if (eq.equivalentCode !== currentProductCode) {
      equivalentCodes.add(eq.equivalentCode)
    }
  })

  const uniqueEquivalents = Array.from(equivalentCodes)

  if (uniqueEquivalents.length === 0) {
    return null
  }

  return (
    <Card className="mt-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          Códigos Equivalentes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1">
          {uniqueEquivalents.map((code, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {code}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
