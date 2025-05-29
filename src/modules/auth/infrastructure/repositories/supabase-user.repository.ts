import type { UserRepository } from "../../domain/repositories/user.repository"
import type { User } from "../../domain/entities/user.entity"
import { UserEntity } from "../../domain/entities/user.entity"
import { supabase } from "@/shared/infrastructure/database/supabase-client"
import type { ID } from "@/shared/types/common"

export class SupabaseUserRepository implements UserRepository {
  async findById(id: ID): Promise<User | null> {
    try {
      const { data, error } = await supabase.from("custom_users").select("*").eq("id", id).eq("active", true).single()

      if (error || !data) return null

      return this.mapToEntity(data)
    } catch (error) {
      console.error("Error finding user by id:", error)
      return null
    }
  }

  async findByName(name: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("custom_users")
        .select("*")
        .eq("name", name)
        .eq("active", true)
        .single()

      if (error || !data) return null

      return this.mapToEntity(data)
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

      return this.mapToEntity(data)
    } catch (error) {
      console.error("Error validating credentials:", error)
      return null
    }
  }

  async save(entity: User): Promise<void> {
    try {
      const { error } = await supabase.from("custom_users").upsert({
        id: entity.id,
        name: entity.name,
        active: entity.active,
        created_at: entity.createdAt.toISOString(),
      })

      if (error) {
        throw new Error(`Failed to save user: ${error.message}`)
      }
    } catch (error) {
      console.error("Error saving user:", error)
      throw error
    }
  }

  async delete(id: ID): Promise<void> {
    try {
      const { error } = await supabase.from("custom_users").delete().eq("id", id)

      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  }

  private mapToEntity(data: any): UserEntity {
    return UserEntity.create({
      id: data.id,
      name: data.name,
      active: data.active,
      createdAt: new Date(data.created_at),
    })
  }
}
