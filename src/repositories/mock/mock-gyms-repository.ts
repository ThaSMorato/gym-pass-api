import { vi } from 'vitest'
import { GymsRepository } from '../gyms-repository'

export const mockedGymsRepository: GymsRepository = {
  findById: vi.fn(),
  create: vi.fn(),
}
