import { User } from "@/src/shared/domain/entities/user.entity"

export interface IUserRepository {
  findByName(name: string): Promise<User | null>
  validateCredentials(name: string, password: string): Promise<User | null>
}
