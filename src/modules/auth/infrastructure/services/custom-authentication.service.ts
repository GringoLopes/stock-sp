import type { AuthenticationService } from "../../domain/services/authentication.service"
import type { User } from "../../domain/entities/user.entity"
import type { UserRepository } from "../../domain/repositories/user.repository"
import { SessionManager } from "@/shared/infrastructure/session/session-manager"

export class CustomAuthenticationService implements AuthenticationService {
  constructor(private readonly userRepository: UserRepository) {}

  async authenticate(name: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.validateCredentials(name, password)

      if (user && user.active) {
        SessionManager.setSession(user)
        return user
      }

      return null
    } catch (error) {
      console.error("Authentication error:", error)
      return null
    }
  }

  getCurrentUser(): User | null {
    return SessionManager.getCurrentUser()
  }

  async logout(): Promise<void> {
    SessionManager.clearSession()
  }

  isAuthenticated(): boolean {
    return SessionManager.isAuthenticated()
  }
}
