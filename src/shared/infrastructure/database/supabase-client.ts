import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // We handle sessions manually
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'stock-sp-optimized'
    }
  },
  // Configurações de performance otimizadas
  realtime: {
    params: {
      eventsPerSecond: 10 // Limita eventos para economizar recursos
    }
  }
})

// Configuração de timeout global para consultas longas
const QUERY_TIMEOUT = 30000 // 30 segundos

// Helper para consultas com timeout
export const executeWithTimeout = async <T>(
  queryPromise: Promise<T>,
  timeoutMs: number = QUERY_TIMEOUT
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Query timeout after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return Promise.race([queryPromise, timeoutPromise])
}

// Helper para retry automático em caso de falha temporária
export const executeWithRetry = async <T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error = new Error("Unknown error")
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn()
    } catch (error) {
      lastError = error as Error
      
      // Não retry em erros de validação ou não encontrado
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code
        if (errorCode === 'PGRST116' || errorCode === '23505') {
          throw error
        }
      }
      
      if (attempt === maxRetries) {
        break
      }
      
      // Delay progressivo: 1s, 2s, 3s...
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
    }
  }
  
  throw new Error(`Query failed after ${maxRetries} attempts: ${lastError.message}`)
}
