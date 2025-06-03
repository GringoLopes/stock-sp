// src/shared/domain/entities/user.entity.ts
import { BaseEntity, ID } from "@/src/shared/types/common"

export interface User extends BaseEntity {
  name: string
  active: boolean
  is_admin: boolean
  must_change_password?: boolean
  password_changed_at?: Date
}

export class UserEntity implements User {
  constructor(
    public readonly id: ID,
    public readonly name: string,
    public readonly active: boolean,
    public readonly is_admin: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt?: Date,
    public readonly must_change_password?: boolean,
    public readonly password_changed_at?: Date,
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
    is_admin: boolean
    createdAt: Date
    updatedAt?: Date
    must_change_password?: boolean
    password_changed_at?: Date
  }): UserEntity {
    return new UserEntity(
      props.id, 
      props.name.trim(), 
      props.active, 
      props.is_admin,
      props.createdAt, 
      props.updatedAt,
      props.must_change_password,
      props.password_changed_at
    )
  }

  isActive(): boolean {
    return this.active
  }

  isAdmin(): boolean {
    return this.is_admin
  }

  getDisplayName(): string {
    return this.name
  }

  canAccessAdminPanel(): boolean {
    return this.isActive() && this.isAdmin()
  }

  mustChangePassword(): boolean {
    return this.must_change_password === true
  }
}