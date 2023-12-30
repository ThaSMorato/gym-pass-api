import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockedCheckInsRepository } from '@/repositories/mock/mock-check-ins-repository'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { ValidateCheckInUseCase } from './validate-check-in'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

const gymId = 'a_gym_id'
const userId = 'a_user_id'

let checkInId: string

const checkInResponse = {
  created_at: new Date(),
  gym_id: gymId,
  user_id: userId,
  id: 'a_checkin_id_1',
  validated_at: null,
}

const save = vi.fn()
const findById = vi.fn()

const repository = {
  ...mockedCheckInsRepository,
  save,
  findById,
}

let sut: ValidateCheckInUseCase
let inMemoryCheckInsRepository: InMemoryCheckInsRepository

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
      sut = new ValidateCheckInUseCase(repository)
    })

    it('should be able to validate the check in', async () => {
      vi.setSystemTime(new Date(2022, 8, 28, 10, 0, 0))
      findById.mockResolvedValue(checkInResponse)

      const { checkin } = await sut.execute({ checkInId: checkInResponse.id })

      expect(checkin).toEqual(
        expect.objectContaining({
          gym_id: gymId,
          user_id: userId,
          id: expect.any(String),
          validated_at: expect.any(Date),
        }),
      )
      expect(findById).toBeCalledTimes(1)
      expect(save).toBeCalledTimes(1)
      expect(save).toBeCalledWith({
        ...checkInResponse,
        validated_at: new Date(),
      })
    })

    it('should not be able to validate an inexistent check in', async () => {
      vi.setSystemTime(new Date(2022, 8, 28, 10, 0, 0))
      findById.mockResolvedValue(null)

      try {
        await sut.execute({ checkInId: 'not_a_check_in_id' })
      } catch (error) {
        expect(findById).toBeCalledTimes(1)
        expect(save).not.toBeCalled()
        expect(error).toBeInstanceOf(ResourceNotFoundError)
      }
    })
  })

  describe('Integration tests', () => {
    beforeEach(async () => {
      inMemoryCheckInsRepository = new InMemoryCheckInsRepository()
      sut = new ValidateCheckInUseCase(inMemoryCheckInsRepository)

      const { id } = await inMemoryCheckInsRepository.create({
        gym_id: gymId,
        user_id: userId,
      })

      checkInId = id
    })

    it('should be able to validate the check in', async () => {
      const { checkin } = await sut.execute({ checkInId })

      expect(checkin).toEqual(
        expect.objectContaining({
          gym_id: gymId,
          user_id: userId,
          id: expect.any(String),
          validated_at: expect.any(Date),
        }),
      )
      expect(inMemoryCheckInsRepository.items[0].validated_at).toEqual(
        expect.any(Date),
      )
    })

    it('should not be able to validate an inexistence check in', async () => {
      await expect(() =>
        sut.execute({ checkInId: 'a_not_existence_id' }),
      ).rejects.toBeInstanceOf(ResourceNotFoundError)
    })
  })
})
