import { createServerClient as createClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"
import { CookieOptions } from "@supabase/ssr"

export const createServerClient = async () => {
  const cookieStore = await cookies()
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options?: CookieOptions) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options?: CookieOptions) {
          cookieStore.set(name, "", { ...options, maxAge: 0 })
        }
      }
    }
  )
}