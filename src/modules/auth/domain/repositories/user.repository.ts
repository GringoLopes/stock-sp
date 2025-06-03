import type { User } from "@/src/shared/domain/entities/user.entity"
import type { Repository } from "@/src/shared/types/common"

export interface UserRepository extends Repository<User> {
  findByName(name: string): Promise<User | null>
  validateCredentials(name: string, password: string): Promise<User | null>
  findActive(): Promise<User[]>
  updateLastLogin(userId: string): Promise<void>
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>
}