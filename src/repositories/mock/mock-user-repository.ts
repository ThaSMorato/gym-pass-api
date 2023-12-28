import { vi } from 'vitest'

export const mockedUserRepository = {
  create: vi.fn(),
  findByEmail: vi.fn(),
  findById: vi.fn(),
}
