import type { Repository } from "@/shared/types/common"
import type { User } from "../entities/user.entity"

export interface UserRepository extends Repository<User> {
  findByName(name: string): Promise<User | null>
  validateCredentials(name: string, password: string): Promise<User | null>
}
