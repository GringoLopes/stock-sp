import type { AuthenticationService } from "../../domain/services/authentication.service"
import type { User } from "@/src/shared/domain/entities/user.entity"
import type { UserRepository } from "../../domain/repositories/user.repository"
import { SessionManager } from "@/src/shared/infrastructure/session/session-manager"

export class CustomAuthenticationService implements AuthenticationService {
  constructor(private readonly userRepository: UserRepository) {}

  async authenticate(name: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.validateCredentials(name, password)

      if (user && user.active) {
        // Define o usuário na sessão local
        SessionManager.setSession(user)

        // Atualiza o último login
        try {
          await this.userRepository.updateLastLogin(user.id)
        } catch (error) {
          console.error('Error updating last login:', error)
          // Não falha o login por causa disso
        }
        
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
    try {
      SessionManager.clearSession()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  isAuthenticated(): boolean {
    return SessionManager.isAuthenticated()
  }

  isAdmin(): boolean {
    return SessionManager.isAdmin()
  }
}