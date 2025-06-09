import { ID } from "@/src/shared/types/common"

export interface Product {
  id: ID
  product: string
  stock: number
  price: number
  application?: string
  createdAt: Date
  updatedAt?: Date
}

export class ProductEntity implements Product {
  constructor(
    public readonly id: ID,
    public readonly product: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly createdAt: Date,
    public readonly updatedAt?: Date,
    public readonly application?: string,
  ) {
    this.validateProduct()
  }

  private validateProduct(): void {
    if (!this.product || this.product.trim().length === 0) {
      throw new Error("Product name cannot be empty")
    }

    if (this.price < 0) {
      throw new Error("Product price cannot be negative")
    }

    if (this.stock < 0) {
      throw new Error("Stock quantity cannot be negative")
    }
  }

  static create(props: {
    id: ID
    product: string
    price: number
    stock: number
    createdAt: Date
    updatedAt?: Date
    application?: string
  }): ProductEntity {
    return new ProductEntity(
      props.id,
      props.product.trim(),
      props.price,
      props.stock,
      props.createdAt,
      props.updatedAt,
      props.application?.trim(),
    )
  }

  isInStock(): boolean {
    return this.stock > 0
  }

  isLowStock(threshold = 10): boolean {
    return this.stock <= threshold
  }

  getFormattedPrice(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.price)
  }

  getStockStatus(): "high" | "medium" | "low" | "out" {
    if (this.stock === 0) return "out"
    if (this.stock <= 10) return "low"
    if (this.stock <= 50) return "medium"
    return "high"
  }

  matchesSearch(query: string): boolean {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return true

    const searchableFields = [this.product, this.application].filter(Boolean)

    return searchableFields.some((field) => field!.toLowerCase().includes(searchTerm))
  }
}
