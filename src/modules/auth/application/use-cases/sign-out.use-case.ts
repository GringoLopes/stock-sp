import { AuthRepository } from "../../domain/repositories/auth.repository"

export class SignOutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    return this.authRepository.signOut()
  }
} 