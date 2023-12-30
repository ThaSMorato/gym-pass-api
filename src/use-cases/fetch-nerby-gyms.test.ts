import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockedGymsRepository } from '@/repositories/mock/mock-gyms-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { Gym } from '@prisma/client'
import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms'

const gymId2 = 'q_gym_2'
const gymId1 = 'q_gym_1'

const gym1 = {
  title: 'JavaScript Gym',
  description: '',
  phone: '',
  id: gymId1,
  latitude: -27.2092052,
  longitude: -49.6401091,
}

const gym2 = {
  title: 'HTML Gym',
  description: '',
  phone: '',
  id: gymId2,
  latitude: -27.0610928,
  longitude: -49.5229501,
}

const params = {
  userLatitude: -27.2092052,
  userLongitude: -49.6401091,
}

const gymsResponse = [
  {
    title: gym1.title,
    description: gym1.description,
    phone: gym1.phone,
    id: gym1.id,
    latitude: new Decimal(gym1.latitude),
    longitude: new Decimal(gym1.longitude),
    created_at: new Date(),
  },
]

const findManyNearBy = vi
  .fn()
  .mockImplementation((query: string) =>
    gymsResponse.filter((gym: Gym) => gym.title.includes(query)),
  )

const repository = {
  ...mockedGymsRepository,
  findManyNearBy,
}

let inMemoryGymsRepository: InMemoryGymsRepository
let sut: FetchNearbyGymsUseCase

describe('Fetch Nearby Gyms Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new FetchNearbyGymsUseCase(repository)
    })

    it('should call findManyNearBy and return its response', async () => {
      findManyNearBy.mockResolvedValue(gymsResponse)

      const { gyms } = await sut.execute(params)

      expect(gyms).toEqual([
        expect.objectContaining({
          id: gymId1,
        }),
      ])
      expect(findManyNearBy).toBeCalledTimes(1)
      expect(findManyNearBy).toHaveBeenCalledWith({
        latitude: params.userLatitude,
        longitude: params.userLongitude,
      })
      expect(gyms).toHaveLength(1)
    })
  })

  describe('Integration tests', () => {
    beforeEach(async () => {
      inMemoryGymsRepository = new InMemoryGymsRepository()
      sut = new FetchNearbyGymsUseCase(inMemoryGymsRepository)

      await inMemoryGymsRepository.create(gym1)
      await inMemoryGymsRepository.create(gym2)
    })

    it('should be able to fetch nearby gyms', async () => {
      const { gyms } = await sut.execute(params)

      expect(gyms).toHaveLength(1)
      expect(gyms).toEqual([
        expect.objectContaining({
          title: 'JavaScript Gym',
        }),
      ])
    })
  })
})
