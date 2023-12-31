import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockedCheckInsRepository } from '@/repositories/mock/mock-check-ins-repository'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { FetchUserCheckInsHistoryUseCase } from './fetch-user-check-ins-history'

const userId = 'a_user_id'
const gymId1 = 'q_gym_1'
const gymId2 = 'q_gym_2'

const findManyByUserId = vi.fn()

const checkIn = {
  id: 'a_checkin_id_1',
  created_at: new Date(),
  gym_id: gymId1,
  user_id: userId,
  validated_at: null,
}

const repository = {
  ...mockedCheckInsRepository,
  findManyByUserId,
}

let inMemoryCheckInsRepository: InMemoryCheckInsRepository
let sut: FetchUserCheckInsHistoryUseCase

describe('Fetch Check In History Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new FetchUserCheckInsHistoryUseCase(repository)
    })

    it('should be able to check in', async () => {
      findManyByUserId.mockResolvedValue([checkIn, checkIn])

      const { checkIns } = await sut.execute({ userId, page: 1 })

      expect(checkIns).toEqual([
        expect.objectContaining({
          gym_id: gymId1,
          user_id: userId,
          id: expect.any(String),
        }),
        expect.objectContaining({
          gym_id: gymId1,
          user_id: userId,
          id: expect.any(String),
        }),
      ])
      expect(findManyByUserId).toBeCalledTimes(1)
      expect(findManyByUserId).toHaveBeenCalledWith(userId, 1)
    })
  })

  describe('Integration tests', () => {
    beforeEach(async () => {
      inMemoryCheckInsRepository = new InMemoryCheckInsRepository()
      sut = new FetchUserCheckInsHistoryUseCase(inMemoryCheckInsRepository)

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
      const { checkIns } = await sut.execute({ userId, page: 1 })

      expect(checkIns).toHaveLength(2)
      expect(checkIns).toEqual([
        expect.objectContaining({
          gym_id: gymId1,
          user_id: userId,
          id: expect.any(String),
        }),
        expect.objectContaining({
          gym_id: gymId2,
          user_id: userId,
          id: expect.any(String),
        }),
      ])
    })

    it('should be able to fetch paginated check-in history', async () => {
      for (let i = 3; i <= 22; i++) {
        await inMemoryCheckInsRepository.create({
          user_id: userId,
          gym_id: `a_gym_${i}`,
        })
      }

      const { checkIns } = await sut.execute({ userId, page: 2 })

      expect(checkIns).toHaveLength(2)
      expect(checkIns).toEqual([
        expect.objectContaining({
          gym_id: 'a_gym_21',
          user_id: userId,
          id: expect.any(String),
        }),
        expect.objectContaining({
          gym_id: 'a_gym_22',
          user_id: userId,
          id: expect.any(String),
        }),
      ])
    })
  })
})
