import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockedGymsRepository } from '@/repositories/mock/mock-gyms-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { SearchGymsUseCase } from './search-gyms'
import { Decimal } from '@prisma/client/runtime/library'
import { Gym } from '@prisma/client'

const gymId2 = 'q_gym_2'
const gymId1 = 'q_gym_1'

const gym1 = {
  title: 'JavaScript Gym',
  description: '',
  phone: '',
  id: gymId1,
  latitude: 0,
  longitude: 0,
}

const gym2 = {
  title: 'HTML Gym',
  description: '',
  phone: '',
  id: gymId2,
  latitude: 0,
  longitude: 0,
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
  {
    title: gym2.title,
    description: gym2.description,
    phone: gym2.phone,
    id: gym2.id,
    latitude: new Decimal(gym2.latitude),
    longitude: new Decimal(gym2.longitude),
    created_at: new Date(),
  },
]

const searchMany = vi
  .fn()
  .mockImplementation((query: string) =>
    gymsResponse.filter((gym: Gym) => gym.title.includes(query)),
  )

const repository = {
  ...mockedGymsRepository,
  searchMany,
}

let inMemoryGymsRepository: InMemoryGymsRepository
let sut: SearchGymsUseCase

describe('Search Gyms Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new SearchGymsUseCase(repository)
    })

    it('should be able to search by title', async () => {
      const query = 'Gym'

      const { gyms } = await sut.execute({ query, page: 1 })

      expect(gyms).toEqual([
        expect.objectContaining({
          id: gymId1,
        }),
        expect.objectContaining({
          id: gymId2,
        }),
      ])
      expect(searchMany).toBeCalledTimes(1)
      expect(searchMany).toHaveBeenCalledWith(query, 1)
      expect(gyms).toHaveLength(2)
    })

    it('should be able to search by title', async () => {
      const query = 'Java'

      const { gyms } = await sut.execute({ query, page: 1 })

      expect(gyms).toEqual([
        expect.objectContaining({
          id: gymId1,
        }),
      ])
      expect(searchMany).toBeCalledTimes(1)
      expect(searchMany).toHaveBeenCalledWith(query, 1)
      expect(gyms).toHaveLength(1)
    })
  })

  describe('Integration tests', () => {
    beforeEach(async () => {
      inMemoryGymsRepository = new InMemoryGymsRepository()
      sut = new SearchGymsUseCase(inMemoryGymsRepository)

      await inMemoryGymsRepository.create(gym1)
      await inMemoryGymsRepository.create(gym2)
    })

    it('should be able to search for gyms', async () => {
      const query = 'JavaScript'
      const { gyms } = await sut.execute({ query, page: 1 })

      expect(gyms).toHaveLength(1)
      expect(gyms).toEqual([
        expect.objectContaining({
          title: 'JavaScript Gym',
        }),
      ])
    })
    it('should be able to fetch paginated gyms', async () => {
      for (let i = 3; i <= 23; i++) {
        await inMemoryGymsRepository.create({
          ...gym1,
          title: `JavaScript Gym ${i}`,
        })
      }

      const query = 'JavaScript'
      const { gyms } = await sut.execute({ query, page: 2 })

      expect(gyms).toHaveLength(2)
      expect(gyms).toEqual([
        expect.objectContaining({
          title: 'JavaScript Gym 22',
          id: expect.any(String),
        }),
        expect.objectContaining({
          title: 'JavaScript Gym 23',
          id: expect.any(String),
        }),
      ])
    })
  })
})
