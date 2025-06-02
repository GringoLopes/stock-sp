import { User } from "@/src/shared/domain/entities/user.entity"
import { AuthRepository } from "../../domain/repositories/auth.repository"

export class SignInUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(name: string, password: string): Promise<User | null> {
    return this.authRepository.signIn(name, password)
  }
} 