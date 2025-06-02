import { User } from "@/src/shared/domain/entities/user.entity"

export interface AuthRepository {
  signIn(name: string, password: string): Promise<User | null>
  signOut(): Promise<void>
  getCurrentUser(): User | null
} 