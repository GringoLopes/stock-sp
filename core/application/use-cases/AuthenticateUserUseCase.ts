import type { IUserRepository } from "@/core/domain/repositories/IUserRepository"
import type { User } from "@/core/domain/entities/User"

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
