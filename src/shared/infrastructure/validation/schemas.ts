import { z } from "zod"

export const LoginSchema = z.object({
  name: z.string().min(1, "Nome de usuário é obrigatório").trim(),
  password: z.string().min(1, "Senha é obrigatória"),
})

export const ProductSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
})

export type LoginRequest = z.infer<typeof LoginSchema>
export type ProductSearchRequest = z.infer<typeof ProductSearchSchema>
