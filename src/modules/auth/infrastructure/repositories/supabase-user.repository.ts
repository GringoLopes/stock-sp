import type { UserRepository } from "../../domain/repositories/user.repository"
import { User, UserEntity } from "@/src/shared/domain/entities/user.entity"
import { supabase } from "@/src/shared/infrastructure/database/supabase-client"
import { ID } from "@/src/shared/types/common"

export class SupabaseUserRepository implements UserRepository {
  async findById(id: ID): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("custom_users")
        .select("*")
        .eq("id", id)
        .eq("active", true)
        .single()

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

  // Novo método: buscar todos os usuários ativos
  async findActive(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from("custom_users")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true })

      if (error || !data) return []

      return data.map(user => this.mapToEntity(user))
    } catch (error) {
      console.error("Error finding active users:", error)
      return []
    }
  }

  // Novo método: atualizar último login
  async updateLastLogin(userId: ID): Promise<void> {
    try {
      const { error } = await supabase
        .from("custom_users")
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)

      if (error) {
        throw new Error(`Failed to update last login: ${error.message}`)
      }
    } catch (error) {
      console.error("Error updating last login:", error)
      throw error
    }
  }

  async save(entity: User): Promise<void> {
    try {
      const { error } = await supabase.from("custom_users").upsert({
        id: entity.id,
        name: entity.name,
        active: entity.active,
        is_admin: entity.is_admin, // Adicione esta linha
        created_at: entity.createdAt.toISOString(),
        updated_at: entity.updatedAt?.toISOString() || new Date().toISOString()
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
      const { error } = await supabase
        .from("custom_users")
        .delete()
        .eq("id", id)

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
      is_admin: data.is_admin || false, 
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    })
  }
}