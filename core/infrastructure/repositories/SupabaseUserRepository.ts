import { supabase } from "@/lib/supabase/client"
import type { IUserRepository } from "@/core/domain/repositories/IUserRepository"
import { UserMapper } from "@/core/application/dtos/UserDTO"
import { User } from "@/src/shared/domain/entities/user.entity"

export class SupabaseUserRepository implements IUserRepository {
  async findByName(name: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("custom_users")
        .select("*")
        .eq("name", name)
        .eq("active", true)
        .single()

      if (error || !data) return null

      return this.mapToUser(data)
    } catch (error) {
      console.error("Error finding user by name:", error)
      return null
    }
  }

  async validateCredentials(name: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("custom_users")
        .select("*")
        .eq("name", name)
        .eq("password", password)
        .eq("active", true)
        .single()

      if (error || !data) return null

      return this.mapToUser(data)
    } catch (error) {
      console.error("Error validating credentials:", error)
      return null
    }
  }

  private mapToUser(data: any): User {
    return {
      id: data.id,
      name: data.name,
      active: data.active,
      is_admin: data.is_admin,
      createdAt: new Date(data.created_at)
    }
  }
}
