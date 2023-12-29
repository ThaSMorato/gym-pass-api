import { vi } from 'vitest'
import { CheckInsRepository } from '../check-ins-repository'

export const mockedCheckInsRepository: CheckInsRepository = {
  create: vi.fn(),
  findByUserIdOnDate: vi.fn(),
  findManyByUserId: vi.fn(),
  countByUserId: vi.fn(),
}
