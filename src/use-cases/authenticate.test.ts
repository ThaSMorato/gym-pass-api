import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { AuthenticateUseCase } from './authenticate'
import { IvalidCredentialsError } from './errors/invalid-credentials-errors'

const user = {
  name: 'Jhon Doe',
  email: 'jhon@doe.com',
  password: '4_str0ng_p4ssw0rd',
}

const findByEmail = vi.fn()

const repository = {
  create: vi.fn(),
  findByEmail,
}

describe('Authenticate Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    it('should give an error if findByEmail returns null', async () => {
      findByEmail.mockResolvedValue(null)

      const sut = new AuthenticateUseCase(repository)

      await expect(() => sut.execute(user)).rejects.toBeInstanceOf(
        IvalidCredentialsError,
      )
    })

    it('should give an error if wrong passwords is passed', async () => {
      const password_hash = await hash('not_user_password', 6)

      const responseUser = {
        ...user,
        id: 'a_user_id_1',
        created_at: new Date(),
        password_hash,
      }

      findByEmail.mockResolvedValue(responseUser)

      const sut = new AuthenticateUseCase(repository)

      await expect(() => sut.execute(user)).rejects.toBeInstanceOf(
        IvalidCredentialsError,
      )
    })

    it('should give an error if wrong passwords is passed', async () => {
      const password_hash = await hash(user.password, 6)

      const responseUser = {
        ...user,
        id: 'a_user_id_1',
        created_at: new Date(),
        password_hash,
      }

      findByEmail.mockResolvedValue(responseUser)

      const sut = new AuthenticateUseCase(repository)

      const { user: returnedUser } = await sut.execute(user)

      expect(returnedUser).toEqual(responseUser)
    })
  })

  describe('Integration tests', () => {
    it('should be able to authenticate', async () => {
      const inMemoryUserRepository = new InMemoryUsersRepository()

      const password_hash = await hash(user.password, 6)

      await inMemoryUserRepository.create({ ...user, password_hash })

      const sut = new AuthenticateUseCase(inMemoryUserRepository)

      const { user: userResponse } = await sut.execute(user)

      expect(userResponse).toEqual(
        expect.objectContaining({
          name: user.name,
          email: user.email,
          id: expect.any(String),
        }),
      )
    })
    it('should not be able to authenticate with a wrong email', async () => {
      const inMemoryUserRepository = new InMemoryUsersRepository()

      const sut = new AuthenticateUseCase(inMemoryUserRepository)

      await expect(() =>
        sut.execute({ ...user, email: 'notjhon@doe.com' }),
      ).rejects.toBeInstanceOf(IvalidCredentialsError)
    })
    it('should not be able to authenticate with a wrong password', async () => {
      const inMemoryUserRepository = new InMemoryUsersRepository()

      const password_hash = await hash(user.password, 6)

      await inMemoryUserRepository.create({ ...user, password_hash })

      const sut = new AuthenticateUseCase(inMemoryUserRepository)

      await expect(() =>
        sut.execute({ ...user, password: 'not_the_password' }),
      ).rejects.toBeInstanceOf(IvalidCredentialsError)
    })
  })
})
