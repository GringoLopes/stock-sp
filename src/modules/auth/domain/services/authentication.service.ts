import type { User } from "../entities/user.entity"

export interface AuthenticationService {
  authenticate(name: string, password: string): Promise<User | null>
  getCurrentUser(): User | null
  logout(): Promise<void>
  isAuthenticated(): boolean
}
