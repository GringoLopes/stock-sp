import { supabase } from "@/lib/supabase/client"
import type { IUserRepository } from "@/core/domain/repositories/IUserRepository"
import type { User } from "@/core/domain/entities/User"
import { UserMapper } from "@/core/application/dtos/UserDTO"

export class SupabaseUserRepository implements IUserRepository {
  async findByName(name: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("custom_users")
        .select("*")
        .eq("name", name)
        .eq("active", true)
        .single()

      if (error || !data) {
        return null
      }

      return UserMapper.toDomain(data)
    } catch (error) {
      console.error("Repository error:", error)
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

      if (error || !data) {
        return null
      }

      return UserMapper.toDomain(data)
    } catch (error) {
      console.error("Repository error:", error)
      return null
    }
  }
}
