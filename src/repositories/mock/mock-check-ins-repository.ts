import { vi } from 'vitest'

export const mockedCheckInsRepository = {
  create: vi.fn(),
  findByUserIdOnDate: vi.fn(),
}
