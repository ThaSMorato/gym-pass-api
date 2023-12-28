import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockedCheckInsRepository } from '@/repositories/mock/mock-check-ins-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'

const userId = 'a_user_id'
const gymId = 'a_gym_id'

const params = {
  userId,
  gymId,
}

const create = vi.fn().mockImplementation((data) => ({
  id: 'a_user_id_1',
  created_at: new Date(),
  gym_id: data.gym_id,
  user_id: data.user_id,
  validated_at: data.validated_at ? new Date(data.validated_at) : null,
}))

const repository = {
  ...mockedCheckInsRepository,
  create,
}

let inMemoryUserRepository: InMemoryCheckInsRepository
let sut: CheckInUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe.skip('Unity tests', () => {
    beforeEach(() => {
      sut = new CheckInUseCase(repository)
    })

    it('should call create function if the user is not already created', async () => {
      await sut.execute(params)

      expect(create).toBeCalledTimes(1)
    })

    it('should not call create and raise an error if user is already created', async () => {
      try {
        await sut.execute(params)
      } catch (_) {
        expect(create).not.toBeCalled()
      }
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
  })
})
