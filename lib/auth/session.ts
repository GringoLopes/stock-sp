"use client"

import { User } from "@/src/shared/domain/entities/user.entity"


const SESSION_KEY = "stock_app_user"

export class SessionManager {
  static setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    }
  }

  static getUser(): User | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(SESSION_KEY)
      if (userData) {
        try {
          const user = JSON.parse(userData)
          return {
            ...user,
            createdAt: new Date(user.createdAt),
          }
        } catch {
          return null
        }
      }
    }
    return null
  }

  static clearUser(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY)
    }
  }

  static isAuthenticated(): boolean {
    return this.getUser() !== null
  }
}
