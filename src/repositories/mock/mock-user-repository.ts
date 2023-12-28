import { vi } from 'vitest'
import { UsersRepository } from '../users-repository'

export const mockedUserRepository: UsersRepository = {
  create: vi.fn(),
  findByEmail: vi.fn(),
  findById: vi.fn(),
}
