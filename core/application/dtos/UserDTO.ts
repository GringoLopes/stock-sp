import type { User } from "@/core/domain/entities/User"

export interface UserDTO {
  id: string
  name: string
  password: string
  active: boolean
  created_at: string
}

export class UserMapper {
  static toDomain(dto: UserDTO): User {
    return {
      id: dto.id,
      name: dto.name,
      active: dto.active,
      createdAt: new Date(dto.created_at),
    }
  }
}
