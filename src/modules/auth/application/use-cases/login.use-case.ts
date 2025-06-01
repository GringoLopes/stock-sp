import type { UserRepository } from "../../domain/repositories/user.repository"
import { User } from "@/src/shared/domain/entities/user.entity"
import { SessionManager } from "@/src/shared/infrastructure/session/session-manager"
import { Result, UseCase } from "@/src/shared/types/common"

export interface LoginRequest {
  name: string
  password: string
}

export interface LoginResponse {
  user: User
  success: boolean
}

export class LoginUseCase implements UseCase<LoginRequest, LoginResponse> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: LoginRequest): Promise<Result<LoginResponse>> {
    try {
      const { name, password } = request

      if (!name?.trim() || !password) {
        return {
          success: false,
          error: new Error("Nome de usuário e senha são obrigatórios"),
        }
      }

      const user = await this.userRepository.validateCredentials(name.trim(), password)

      if (!user) {
        return {
          success: false,
          error: new Error("Credenciais inválidas"),
        }
      }

      if (!user.active) {
        return {
          success: false,
          error: new Error("Usuário inativo"),
        }
      }

      // Set session
      SessionManager.setSession(user)

      return {
        success: true,
        data: {
          user,
          success: true,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Erro interno do servidor"),
      }
    }
  }
}
