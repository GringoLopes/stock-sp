import { User } from "@/src/shared/domain/entities/user.entity"
import { SignInUseCase } from "../../application/use-cases/sign-in.use-case"
import { SignOutUseCase } from "../../application/use-cases/sign-out.use-case"
import { GetCurrentUserUseCase } from "../../application/use-cases/get-current-user.use-case"
import { SupabaseAuthRepository } from "../repositories/supabase-auth.repository"

export class AuthService {
  private readonly signInUseCase: SignInUseCase
  private readonly signOutUseCase: SignOutUseCase
  private readonly getCurrentUserUseCase: GetCurrentUserUseCase

  constructor() {
    const authRepository = new SupabaseAuthRepository()
    this.signInUseCase = new SignInUseCase(authRepository)
    this.signOutUseCase = new SignOutUseCase(authRepository)
    this.getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository)
  }

  async signIn(name: string, password: string): Promise<User | null> {
    return this.signInUseCase.execute(name, password)
  }

  async signOut(): Promise<void> {
    return this.signOutUseCase.execute()
  }

  getCurrentUser(): User | null {
    return this.getCurrentUserUseCase.execute()
  }
} 