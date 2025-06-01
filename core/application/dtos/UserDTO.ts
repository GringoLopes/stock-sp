import { User } from "@/src/shared/domain/entities/user.entity"

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
      is_admin: false,
      createdAt: new Date(dto.created_at),
    }
  }
}
