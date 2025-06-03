import { User, UserEntity } from "@/src/shared/domain/entities/user.entity"
import { supabase } from "@/src/shared/infrastructure/database/supabase-wrapper"
import { ID } from "@/src/shared/types/common"
import type { UserRepository } from "../../domain/repositories/user.repository"

export class SupabaseUserRepository implements UserRepository {
  async findById(id: ID): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("custom_users")
        .select("id, name, active, is_admin, created_at")
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
        .select("id, name, active, is_admin, created_at")
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
        .rpc('authenticate_user', { 
          p_name: name, 
          p_password: password 
        })

      if (error) throw error

      if (data?.success && data.user) {
        return this.mapToEntity(data.user)
      }

      return null
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

  // Novo método: atualizar senha
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('change_user_password', { 
          p_user_id: userId, 
          p_current_password: currentPassword,
          p_new_password: newPassword 
        })

      if (error) {
        console.error("Error changing password:", error)
        return false
      }

      // Verifica o resultado da função
      if (data && data.success) {
        return true
      }

      // Se houver uma mensagem de erro específica, loga ela
      if (data && data.message) {
        console.error("Password change failed:", data.message)
      }

      return false
    } catch (error) {
      console.error("Error in changePassword:", error)
      return false
    }
  }

  async save(entity: User): Promise<void> {
    try {
      const { error } = await supabase.from("custom_users").upsert({
        id: entity.id,
        name: entity.name,
        active: entity.active,
        is_admin: entity.is_admin,
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
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      must_change_password: data.must_change_password || false,
      password_changed_at: data.password_changed_at ? new Date(data.password_changed_at) : undefined
    })
  }
}