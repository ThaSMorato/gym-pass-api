import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockedCheckInsRepository } from '@/repositories/mock/mock-check-ins-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'

const userId = 'a_user_id'
const gymId = 'a_gym_id'

const params = {
  userId,
  gymId,
}

const checkInResponse = {
  created_at: new Date(),
  gym_id: gymId,
  user_id: userId,
  id: 'a_checkin_id_1',
}

const findByUserIdOnDate = vi.fn()

const create = vi.fn().mockImplementation((data) => ({
  id: 'a_checkin_id_1',
  created_at: new Date(),
  gym_id: data.gym_id,
  user_id: data.user_id,
  validated_at: data.validated_at ? new Date(data.validated_at) : null,
}))

const repository = {
  ...mockedCheckInsRepository,
  create,
  findByUserIdOnDate,
}

let inMemoryUserRepository: InMemoryCheckInsRepository
let sut: CheckInUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new CheckInUseCase(repository)
    })

    it('should be able to check in', async () => {
      const { checkin } = await sut.execute(params)

      expect(checkin).toEqual(
        expect.objectContaining({
          gym_id: gymId,
          user_id: userId,
          id: expect.any(String),
        }),
      )
      expect(create).toBeCalledTimes(1)
    })

    it('should not be able to check in twice in the same day', async () => {
      findByUserIdOnDate.mockResolvedValue(checkInResponse)

      try {
        await sut.execute(params)
      } catch (_) {
        expect(create).not.toBeCalled()
      }
    })

    it('should be able to check in twice in different day', async () => {
      findByUserIdOnDate.mockResolvedValue(null)

      const { checkin } = await sut.execute(params)

      expect(checkin).toEqual(
        expect.objectContaining({
          gym_id: gymId,
          user_id: userId,
          id: expect.any(String),
        }),
      )
      expect(create).toBeCalledTimes(1)
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryUserRepository = new InMemoryCheckInsRepository()
      sut = new CheckInUseCase(inMemoryUserRepository)
    })

    it('should be able to check in', async () => {
      const { checkin } = await sut.execute(params)

      expect(checkin).toEqual(
        expect.objectContaining({
          gym_id: gymId,
          user_id: userId,
          id: expect.any(String),
        }),
      )
    })

    it('should not be able to check in twice in the same day', async () => {
      vi.setSystemTime(new Date(2022, 8, 28, 10, 0, 0))

      await sut.execute(params)

      await expect(() => sut.execute(params)).rejects.toBeInstanceOf(Error)
    })

    it('should be able to check in twice in different days', async () => {
      vi.setSystemTime(new Date(2022, 8, 28, 10, 0, 0))

      await sut.execute(params)

      vi.setSystemTime(new Date(2022, 8, 29, 10, 0, 0))

      const { checkin } = await sut.execute(params)

      expect(checkin).toEqual(
        expect.objectContaining({
          gym_id: gymId,
          user_id: userId,
          id: expect.any(String),
        }),
      )
    })
  })
})
