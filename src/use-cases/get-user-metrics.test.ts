import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockedCheckInsRepository } from '@/repositories/mock/mock-check-ins-repository'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { GetUserMetricsUseCase } from './get-user-metrics'

const userId = 'a_user_id'
const gymId1 = 'q_gym_1'
const gymId2 = 'q_gym_2'

const countByUserId = vi.fn()

const repository = {
  ...mockedCheckInsRepository,
  countByUserId,
}

let inMemoryCheckInsRepository: InMemoryCheckInsRepository
let sut: GetUserMetricsUseCase

describe('Get User Metrics Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new GetUserMetricsUseCase(repository)
    })

    it('should be able to check in', async () => {
      const expectedCount = 4

      countByUserId.mockResolvedValue(expectedCount)

      const { checkInsCount } = await sut.execute({ userId })

      expect(checkInsCount).toBe(expectedCount)

      expect(countByUserId).toBeCalledTimes(1)
      expect(countByUserId).toHaveBeenCalledWith(userId)
    })
  })

  describe('Integration tests', () => {
    beforeEach(async () => {
      inMemoryCheckInsRepository = new InMemoryCheckInsRepository()
      sut = new GetUserMetricsUseCase(inMemoryCheckInsRepository)

      await inMemoryCheckInsRepository.create({
        user_id: userId,
        gym_id: gymId1,
      })
      await inMemoryCheckInsRepository.create({
        user_id: userId,
        gym_id: gymId2,
      })
    })

    it('should be able to fetch the check in history', async () => {
      const { checkInsCount } = await sut.execute({ userId })

      expect(checkInsCount).toBe(2)
    })
  })
})
