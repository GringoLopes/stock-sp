export interface Product {
  id: string | number
  product: string
  stock: number
  price: number
  application?: string
  createdAt: Date
  updatedAt: Date
}
