import type { User } from "@/core/domain/entities/User"

export interface IUserRepository {
  findByName(name: string): Promise<User | null>
  validateCredentials(name: string, password: string): Promise<User | null>
}
