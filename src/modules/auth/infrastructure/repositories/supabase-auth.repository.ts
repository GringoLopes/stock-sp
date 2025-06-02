import { User } from "@/src/shared/domain/entities/user.entity"
import { AuthRepository } from "../../domain/repositories/auth.repository"
import { supabase } from "@/src/shared/infrastructure/database/supabase-wrapper"

export class SupabaseAuthRepository implements AuthRepository {
  private currentUser: User | null = null

  async signIn(name: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.rpc("authenticate_user", {
        p_name: name,
        p_password: password,
      })

      if (error || !data) {
        console.error("Authentication error:", error)
        return null
      }

      const user: User = {
        id: data.id,
        name: data.name,
        role: data.role,
      }

      this.currentUser = user
      return user
    } catch (error) {
      console.error("Sign in error:", error)
      return null
    }
  }

  async signOut(): Promise<void> {
    this.currentUser = null
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }
} 