import { User } from "@/src/shared/domain/entities/user.entity"

export interface AuthenticationService {
  authenticate(name: string, password: string): Promise<User | null>
  getCurrentUser(): User | null
  logout(): Promise<void>
  isAuthenticated(): boolean
}
