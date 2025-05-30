import type { User } from "@/modules/auth/domain/entities/user.entity"

const SESSION_KEY = "stock_app_user_session"

export interface SessionData {
  user: User
  expiresAt: number
}

export class SessionManager {
  private static readonly EXPIRY_HOURS = 24

  static setSession(user: User): void {
    if (typeof window === "undefined") return

    const expiresAt = Date.now() + this.EXPIRY_HOURS * 60 * 60 * 1000
    const sessionData: SessionData = { user, expiresAt }

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
    } catch (error) {
      console.error("Failed to save session:", error)
    }
  }

  static getSession(): SessionData | null {
    if (typeof window === "undefined") return null

    try {
      const sessionJson = localStorage.getItem(SESSION_KEY)
      if (!sessionJson) return null

      const sessionData: SessionData = JSON.parse(sessionJson)

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        this.clearSession()
        return null
      }

      // Reconstruct dates
      sessionData.user.createdAt = new Date(sessionData.user.createdAt)

      return sessionData
    } catch (error) {
      console.error("Failed to parse session:", error)
      this.clearSession()
      return null
    }
  }

  static clearSession(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(SESSION_KEY)
    } catch (error) {
      console.error("Failed to clear session:", error)
    }
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  static getCurrentUser(): User | null {
    const session = this.getSession()
    return session?.user || null
  }
}
