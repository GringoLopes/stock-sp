import { SessionManager } from "@/src/shared/infrastructure/session/session-manager"
import { Result, UseCase } from "@/src/shared/types/common"
import type { UserRepository } from "../../domain/repositories/user.repository"

export interface ChangePasswordRequest {
  userId: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
}

export class ChangePasswordUseCase implements UseCase<ChangePasswordRequest, ChangePasswordResponse> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: ChangePasswordRequest): Promise<Result<ChangePasswordResponse>> {
    try {
      const { userId, currentPassword, newPassword, confirmPassword } = request

      // Validações básicas
      if (!currentPassword || !newPassword || !confirmPassword) {
        return {
          success: false,
          error: new Error("Senha atual, nova senha e confirmação são obrigatórias"),
        }
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          error: new Error("As senhas não conferem"),
        }
      }

      // Validação de força da senha (6 caracteres conforme o script SQL)
      if (newPassword.length < 6) {
        return {
          success: false,
          error: new Error("A senha deve ter no mínimo 8 caracteres"),
        }
      }

      // Validação contra senha padrão
      if (newPassword === "1234") {
        return {
          success: false,
          error: new Error("A nova senha não pode ser igual à senha padrão"),
        }
      }

      // Validação se é diferente da atual
      if (currentPassword === newPassword) {
        return {
          success: false,
          error: new Error("A nova senha deve ser diferente da senha atual"),
        }
      }

      // Atualizar a senha no repositório
      const updated = await this.userRepository.changePassword(userId, currentPassword, newPassword)

      if (!updated) {
        return {
          success: false,
          error: new Error("Erro ao atualizar a senha. Verifique se a senha atual está correta."),
        }
      }

      // Atualizar a sessão para refletir que o usuário não precisa mais trocar a senha
      const currentUser = SessionManager.getCurrentUser()
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          must_change_password: false,
          password_changed_at: new Date()
        }
        SessionManager.setSession(updatedUser)
      }

      return {
        success: true,
        data: {
          success: true,
          message: "Senha alterada com sucesso",
        },
      }
    } catch (error) {
      console.error('Error changing password:', error)
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Erro ao alterar senha"),
      }
    }
  }
} 