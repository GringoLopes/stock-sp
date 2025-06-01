import { SessionManager } from "@/src/shared/infrastructure/session/session-manager"
import { Result, UseCase } from "@/src/shared/types/common"

export type LogoutRequest = {}

export interface LogoutResponse {
  success: boolean
}

export class LogoutUseCase implements UseCase<LogoutRequest, LogoutResponse> {
  async execute(_request: LogoutRequest): Promise<Result<LogoutResponse>> {
    try {
      SessionManager.clearSession()

      return {
        success: true,
        data: { success: true },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Erro ao fazer logout"),
      }
    }
  }
}
