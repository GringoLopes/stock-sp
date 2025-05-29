import { SupabaseUserRepository } from "@/core/infrastructure/repositories/SupabaseUserRepository"
import { AuthenticateUserUseCase } from "@/core/application/use-cases/AuthenticateUserUseCase"
import { SessionManager } from "@/lib/auth/session"
import type { User } from "@/core/domain/entities/User"

export class CustomAuthService {
  private userRepository = new SupabaseUserRepository()
  private authenticateUseCase = new AuthenticateUserUseCase(this.userRepository)

  async signIn(name: string, password: string): Promise<User | null> {
    try {
      const user = await this.authenticateUseCase.execute(name, password)

      if (user) {
        SessionManager.setUser(user)
        return user
      }

      return null
    } catch (error) {
      console.error("Authentication error:", error)
      return null
    }
  }

  async signOut(): Promise<void> {
    SessionManager.clearUser()
  }

  getCurrentUser(): User | null {
    return SessionManager.getUser()
  }

  isAuthenticated(): boolean {
    return SessionManager.isAuthenticated()
  }
}
