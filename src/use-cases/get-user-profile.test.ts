import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { mockedUserRepository } from '@/repositories/mock/mock-user-repository'
import { GetUserProfileUseCase } from './get-user-profile'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

const user = {
  name: 'Jhon Doe',
  email: 'jhon@doe.com',
  id: 'a_user_id_1',
  created_at: new Date(),
}

const findById = vi.fn()

const repository = {
  ...mockedUserRepository,
  findById,
}

let sut: GetUserProfileUseCase
let inMemoryUserRepository: InMemoryUsersRepository

describe('Authenticate Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new GetUserProfileUseCase(repository)
    })
    it('should give an error if findById returns null', async () => {
      findById.mockResolvedValue(null)

      await expect(() =>
        sut.execute({ userId: user.id }),
      ).rejects.toBeInstanceOf(ResourceNotFoundError)
    })

    it('should return user if correct id passed', async () => {
      findById.mockResolvedValue(user)

      const { user: returnedUser } = await sut.execute({ userId: user.id })

      expect(returnedUser).toEqual(user)
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryUserRepository = new InMemoryUsersRepository()
      sut = new GetUserProfileUseCase(inMemoryUserRepository)
    })

    it('should be able to get user profile', async () => {
      const password_hash = await hash('1234567', 6)

      const { id } = await inMemoryUserRepository.create({
        ...user,
        password_hash,
      })

      const { user: userResponse } = await sut.execute({ userId: id })

      expect(userResponse).toEqual(
        expect.objectContaining({
          id,
          name: user.name,
          email: user.email,
        }),
      )
    })
    it('should not be able to get user profile with wrong id', async () => {
      await expect(() =>
        sut.execute({ userId: 'not_a_user_id' }),
      ).rejects.toBeInstanceOf(ResourceNotFoundError)
    })
  })
})
