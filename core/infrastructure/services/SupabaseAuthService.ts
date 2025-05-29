import { supabase } from "@/lib/supabase/client"
import type { User } from "@/core/domain/entities/User"

export class SupabaseAuthService {
  async signIn(username: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      })

      if (error || !data.user) {
        return null
      }

      return {
        id: data.user.id,
        username: data.user.email || username,
        createdAt: new Date(data.user.created_at),
        updatedAt: new Date(data.user.updated_at || data.user.created_at),
      }
    } catch (error) {
      console.error("Authentication error:", error)
      return null
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      return {
        id: user.id,
        username: user.email || "",
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at || user.created_at),
      }
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }
}
