import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { CreateGymUseCase } from './create-gym'
import { mockedGymsRepository } from '@/repositories/mock/mock-gyms-repository'

const latitude = -27.2892852
const longitude = -49.6401091
const title = 'javascript gym'
const description = ''
const phone = ''

const params = {
  latitude,
  longitude,
  title,
  description,
  phone,
}

const gym = {
  title,
  description,
  phone,
  id: 'a_gym_id',
  latitude: new Decimal(latitude),
  longitude: new Decimal(longitude),
  created_at: new Date(),
}

const create = vi.fn()

const repository = {
  ...mockedGymsRepository,
  create,
}

let inMemoryGymsRepository: InMemoryGymsRepository
let sut: CreateGymUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new CreateGymUseCase(repository)
    })

    it('should call create function if the user is not already created', async () => {
      await sut.execute(params)

      expect(create).toBeCalledTimes(1)
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryGymsRepository = new InMemoryGymsRepository()
      sut = new CreateGymUseCase(inMemoryGymsRepository)
    })
    it('should be able to register', async () => {
      const { gym: gymResponse } = await sut.execute(params)

      expect(gymResponse).toEqual(
        expect.objectContaining({
          title: gym.title,
          description: gym.description,
          id: expect.any(String),
        }),
      )
    })
  })
})
