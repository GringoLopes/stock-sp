export type ID = string

export interface BaseEntity {
  id: ID
  createdAt: Date
  updatedAt?: Date
}

export interface DomainEvent {
  aggregateId: ID
  eventType: string
  occurredOn: Date
  eventData: Record<string, unknown>
}

export type Result<T, E = Error> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: E
    }

export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<Result<TResponse>>
}

export interface Repository<T extends BaseEntity> {
  findById(id: ID): Promise<T | null>
  save(entity: T): Promise<void>
  delete(id: ID): Promise<void>
}

export interface Query<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>
}
