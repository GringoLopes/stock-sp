import type { IUserRepository } from "@/core/domain/repositories/IUserRepository"
import { User } from "@/src/shared/domain/entities/user.entity"

export class AuthenticateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(name: string, password: string): Promise<User | null> {
    const user = await this.userRepository.validateCredentials(name, password)

    if (!user || !user.active) {
      return null
    }

    return user
  }
}
