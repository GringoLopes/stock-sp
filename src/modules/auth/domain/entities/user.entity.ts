import type { BaseEntity, ID } from "@/shared/types/common"

export interface User extends BaseEntity {
  name: string
  active: boolean
}

export class UserEntity implements User {
  constructor(
    public readonly id: ID,
    public readonly name: string,
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt?: Date,
  ) {
    this.validateName(name)
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("User name cannot be empty")
    }

    if (name.length > 255) {
      throw new Error("User name cannot exceed 255 characters")
    }
  }

  static create(props: {
    id: ID
    name: string
    active: boolean
    createdAt: Date
    updatedAt?: Date
  }): UserEntity {
    return new UserEntity(props.id, props.name.trim(), props.active, props.createdAt, props.updatedAt)
  }

  isActive(): boolean {
    return this.active
  }

  getDisplayName(): string {
    return this.name
  }
}
