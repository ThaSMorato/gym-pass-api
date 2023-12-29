import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockedCheckInsRepository } from '@/repositories/mock/mock-check-ins-repository'
import { mockedGymsRepository } from '@/repositories/mock/mock-gyms-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'

const userId = 'a_user_id'
let gymId = 'a_gym_id'

const latitude = -27.2892852
const longitude = -49.6401091

const distantLatitude = -27.0747279
const distantLongitude = -49.4889672

let params = {
  userId,
  gymId,
  userLatitude: latitude,
  userLongitude: longitude,
}

const checkInResponse = {
  created_at: new Date(),
  gym_id: gymId,
  user_id: userId,
  id: 'a_checkin_id_1',
}

const gym = {
  id: gymId,
  title: 'javascript gym',
  description: '',
  latitude: new Decimal(latitude),
  longitude: new Decimal(longitude),
  phone: '',
  created_at: new Date(),
}

const findByUserIdOnDate = vi.fn()

const findById = vi.fn()

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

const gymsRepository = {
  ...mockedGymsRepository,
  findById,
}

let inMemoryUserRepository: InMemoryCheckInsRepository
let sut: CheckInUseCase
let inMemoryGymsRepository: InMemoryGymsRepository

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
      sut = new CheckInUseCase(repository, gymsRepository)
    })

    it('should be able to check in', async () => {
      findById.mockResolvedValue(gym)

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
      findById.mockResolvedValue(gym)

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

    it('should not be able to check in on a distant gym', async () => {
      findById.mockResolvedValue(gym)

      const sutParams = {
        ...params,
        userLatitude: distantLatitude,
        userLongitude: distantLongitude,
      }

      try {
        await sut.execute(sutParams)
      } catch (_) {
        expect(create).not.toBeCalled()
      }
    })
  })

  describe('Integration tests', () => {
    beforeEach(async () => {
      inMemoryUserRepository = new InMemoryCheckInsRepository()
      inMemoryGymsRepository = new InMemoryGymsRepository()
      sut = new CheckInUseCase(inMemoryUserRepository, inMemoryGymsRepository)

      const { id } = await inMemoryGymsRepository.create({
        latitude,
        longitude,
        title: gym.title,
        description: gym.description,
        phone: gym.phone,
      })

      gymId = id

      params = {
        ...params,
        gymId: id,
      }
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

      await expect(() => sut.execute(params)).rejects.toBeInstanceOf(
        MaxNumberOfCheckInsError,
      )
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

    it('should not be able to check in on distant gym', async () => {
      const sutParams = {
        ...params,
        userLatitude: distantLatitude,
        userLongitude: distantLongitude,
      }

      await expect(() => sut.execute(sutParams)).rejects.toBeInstanceOf(
        MaxDistanceError,
      )
    })
  })
})
