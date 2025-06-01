import type { Repository } from "@/src/shared/types/common"
import type { User } from "@/src/shared/domain/entities/user.entity"

export interface UserRepository extends Repository<User> {
  findByName(name: string): Promise<User | null>
  validateCredentials(name: string, password: string): Promise<User | null>
  findActive(): Promise<User[]>
  updateLastLogin(userId: string): Promise<void>
}